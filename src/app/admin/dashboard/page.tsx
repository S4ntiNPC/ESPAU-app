import { createClient } from '../../../utils/supabase/server'
import { logout } from '../../login/actions'
import { redirect } from 'next/navigation'
import NuevoUsuarioForm from './NuevoUsuarioForm'
import ListaUsuarios from './ListaUsuarios'
import AsignarPacienteForm from './AsignarPacienteForm'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
    
  // Consultas directas al esquema público con las columnas reales
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

  // Formateamos los datos creando 'nombre_completo' para los componentes hijos
  const terapeutas = terapeutasData?.map(t => ({
    id: t.id,
    nombre_completo: `${t.nombre} ${t.apellidos}`.trim()
  })) || []

  const familias = familiasData?.map(f => ({
    id: f.id,
    nombre_completo: `${f.nombre} ${f.apellidos}`.trim()
  })) || []

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-8">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
            <p className="text-gray-500 text-sm">Bienvenido, {user.email}</p>
          </div>
          <form action={logout}>
            <button className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors">
              Cerrar Sesión
            </button>
          </form>
        </header>
        
        {/* Tarjetas de Resumen (Estadísticas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 border rounded-lg bg-blue-50 border-blue-100">
            <h2 className="font-semibold text-blue-800">Usuarios y Terapeutas</h2>
            <p className="text-sm text-blue-600 mt-1">Gestión de accesos y asignaciones.</p>
          </div>
          <div className="p-6 border rounded-lg bg-green-50 border-green-100">
            <h2 className="font-semibold text-green-800">Estadísticas</h2>
            <p className="text-sm text-green-600 mt-1">Métricas y nivel de involucramiento.</p>
          </div>
          <div className="p-6 border rounded-lg bg-purple-50 border-purple-100">
            <h2 className="font-semibold text-purple-800">Banco de Actividades</h2>
            <p className="text-sm text-purple-600 mt-1">Administración de contenido.</p>
          </div>
        </div>

        {/* Sección de Gestión de Usuarios */}
        <div className="mt-10 border-t pt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-500 mb-6">Da de alta terapeutas y cuidadores para que accedan a la plataforma.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario a la izquierda (ocupa 1 columna) */}
            <div className="lg:col-span-1">
              <NuevoUsuarioForm />
            </div>
            
            {/* Tabla a la derecha (ocupa 2 columnas) */}
            <div className="lg:col-span-2">
              <ListaUsuarios />
              <AsignarPacienteForm 
                terapeutas={terapeutas} 
                familias={familias} 
              />
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}