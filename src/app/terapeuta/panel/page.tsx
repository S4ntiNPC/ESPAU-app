import { createClient } from '../../../utils/supabase/server'
import { logout } from '../../login/actions'
import { redirect } from 'next/navigation'
import DirectorioPacientes from './DirectorioPacientes'

type Paciente = {
  id: string // Cambiado a string si usas UUID en tu BD
  nombre: string
  creado_en: string | null
  asignaciones: Array<{
    id: string // Cambiado a string si usas UUID
    estado: string | null
    fecha_completada: string | null
  }>
}

export default async function TerapeutaPanel() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtenemos los pacientes asignados a este terapeuta gracias al RLS.
  // SOLUCIÓN: Usamos "asignaciones:actividades_asignadas" para renombrar la relación
  // y que haga match perfecto con las interfaces del frontend.
  const { data: pacientes, error } = await supabase
    .from('pacientes')
    .select(`
      id, 
      nombre, 
      creado_en,
      asignaciones:actividades_asignadas (
        id,
        estado,
        fecha_completada
      )
    `)
    // Asumiendo que filtramos por el terapeuta actual (Ajusta la columna si se llama diferente)
    .eq('terapeuta_id', user.id)
    .order('nombre')

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera */}
        <header className="bg-white rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel Terapéutico</h1>
            <p className="text-gray-500 text-sm">Directorio de pacientes y seguimiento</p>
          </div>
          <form action={logout}>
            <button className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors">
              Cerrar Sesión
            </button>
          </form>
        </header>

        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">Error al cargar pacientes: {error.message}</div>
        ) : (
          <DirectorioPacientes pacientesIniciales={pacientes || []} />
        )}

      </div>
    </main>
  )
}