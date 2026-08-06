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
  terapeuta_id: string | null;
  familia_id: string | null;
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
    <main className="min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* HEADER: Adaptado para móviles con botones de tamaño táctil accesible */}
        <header className="bg-white rounded-3xl shadow-soft p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-white/50">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-espau-navy tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              Supervisión general, asignaciones y gestión ESPAU.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link 
              href="/admin/banco-actividades"
              className="w-full sm:w-auto text-center bg-espau-blue text-white hover:bg-opacity-90 px-6 py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98]"
            >
              Banco de Actividades
            </Link>
            <form action={logout} className="w-full sm:w-auto">
              <button className="w-full text-center bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-espau-pink px-6 py-3.5 rounded-xl font-semibold transition-all border border-gray-200 active:scale-[0.98]">
                Cerrar Sesión
              </button>
            </form>
          </div>
        </header>
        
        {/* SECCIÓN: Métricas Globales */}
        <section>
          <MetricasDashboard actividades={actividades || []} />
        </section>

        {/* SECCIÓN: Directorio de Pacientes */}
        <section>
          <DirectorioPacientes 
            pacientes={pacientes} 
            terapeutas={terapeutas}
            familias={familias}
          />
        </section>

        {/* SECCIÓN: Gestión de Usuarios */}
        <section className="bg-white rounded-3xl shadow-soft p-6 sm:p-8 border border-white/50">
          <header className="mb-6 sm:mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-espau-navy">Gestión de Usuarios y Asignaciones</h2>
            <p className="text-sm text-gray-500 mt-1.5">
              Da de alta terapeutas y cuidadores, y administra las asignaciones de casos.
            </p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Columna Izquierda: Alta de Usuarios */}
            <div className="lg:col-span-1 lg:border-r lg:border-gray-100 lg:pr-8">
              <NuevoUsuarioForm />
            </div>
            
            {/* Columna Derecha: Directorio y Asignaciones */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-espau-navy mb-4">Directorio de Usuarios</h3>
                <div className="bg-gray-50 rounded-2xl p-1 sm:p-4 border border-gray-100">
                  <ListaUsuarios />
                </div>
              </div>
              
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-espau-navy mb-4">Asignar Paciente a Terapeuta</h3>
                <div className="bg-espau-bgStart/30 rounded-2xl p-4 sm:p-6 border border-espau-blue/10">
                  <AsignarPacienteForm 
                    terapeutas={terapeutas} 
                    familias={familias} 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}