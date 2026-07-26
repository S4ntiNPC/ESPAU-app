import { createClient } from '../../../utils/supabase/server'
import { logout } from '../../login/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NuevoUsuarioForm from './NuevoUsuarioForm'
import ListaUsuarios from './ListaUsuarios'
import AsignarPacienteForm from './AsignarPacienteForm'
import MetricasDashboard from './MetricasDashboard'
import DirectorioPacientes from './DirectorioPacientes'

// Interfaces estrictas
interface PerfilBasico {
  nombre: string;
  apellidos: string | null;
}

interface PacienteRaw {
  id: string;
  nombre: string;
  fecha_nacimiento: string;
  terapeuta_id: string | null; // Añadido para el control de vínculos
  familia_id: string | null;   // Añadido para el control de vínculos
  terapeuta: PerfilBasico | null;
  familia: PerfilBasico | null;
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
    
  const { data: terapeutasData } = await supabase
    .from('perfiles')
    .select('id, nombre, apellidos')
    .eq('rol', 'terapeuta')
    .order('nombre')

  const { data: familiasData } = await supabase
    .from('perfiles')
    .select('id, nombre, apellidos')
    .eq('rol', 'familia')
    .order('nombre')

  const { data: actividades, error: errorActividades } = await supabase
    .from('actividades_asignadas')
    .select('id, estado, quien_realizo')

  if (errorActividades) {
    console.error('Error al cargar las actividades para métricas:', errorActividades)
  }

  // Se agregaron terapeuta_id y familia_id a la consulta
  const { data: pacientesRaw, error: errorPacientes } = await supabase
    .from('pacientes')
    .select(`
      id,
      nombre,
      fecha_nacimiento,
      terapeuta_id,
      familia_id,
      terapeuta:perfiles!pacientes_terapeuta_id_fkey(nombre, apellidos),
      familia:perfiles!pacientes_familia_id_fkey(nombre, apellidos)
    `)
    .eq('inactivo', false)
    .order('creado_en', { ascending: false });

  if (errorPacientes) {
    console.error("Error cargando pacientes:", errorPacientes.message);
  }

  const pacientes = (pacientesRaw || []) as unknown as PacienteRaw[];

  const terapeutas = terapeutasData?.map(t => ({
    id: t.id,
    nombre_completo: `${t.nombre} ${t.apellidos || ''}`.trim()
  })) || []

  const familias = familiasData?.map(f => ({
    id: f.id,
    nombre_completo: `${f.nombre} ${f.apellidos || ''}`.trim()
  })) || []

  return (
    <main className="min-h-screen bg-gradient-to-br from-espau-bgStart via-white to-espau-bgEnd p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-espau-navy tracking-tight">Panel de Administración</h1>
            <p className="text-gray-500 text-sm mt-1">Supervisión general, asignaciones y gestión ESPAU.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link 
              href="/admin/banco-actividades"
              className="flex-1 md:flex-none text-center bg-espau-blue text-white hover:bg-blue-600 shadow-md shadow-blue-200 px-6 py-2.5 rounded-full font-semibold transition-all hover:-translate-y-0.5"
            >
              Banco de Actividades
            </Link>
            <form action={logout} className="flex-1 md:flex-none">
              <button className="w-full text-center bg-white text-gray-600 hover:text-espau-pink px-6 py-2.5 rounded-full font-semibold transition-all border-2 border-gray-200 hover:border-pink-200">
                Cerrar Sesión
              </button>
            </form>
          </div>
        </header>
        
        <section>
          <MetricasDashboard actividades={actividades || []} />
        </section>

        <section>
          {/* AHORA PASAMOS LOS CATÁLOGOS AL DIRECTORIO */}
          <DirectorioPacientes 
            pacientes={pacientes} 
            terapeutas={terapeutas}
            familias={familias}
          />
        </section>

        <section className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white p-6 md:p-8">
          <header className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-espau-navy">Gestión de Usuarios y Asignaciones</h2>
            <p className="text-sm text-gray-500 mt-1">Da de alta terapeutas y cuidadores, y administra las asignaciones de casos.</p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-1 lg:border-r lg:border-gray-100 lg:pr-8">
              <NuevoUsuarioForm />
            </div>
            
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h3 className="text-xl font-bold text-espau-navy mb-4">Directorio de Usuarios</h3>
                <ListaUsuarios />
              </div>
              
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-espau-navy mb-4">Asignar Paciente a Terapeuta</h3>
                <AsignarPacienteForm 
                  terapeutas={terapeutas} 
                  familias={familias} 
                />
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}