import { createClient } from '../../../utils/supabase/server'
import { logout } from '../../login/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DirectorioPacientes from './DirectorioPacientes'

// 1. Interfaces estrictas para evitar 'any' y asegurar la compatibilidad con el componente hijo
interface Asignacion {
  id: string;
  estado: string; // Asumimos que siempre viene un string ('pendiente' o 'completada') por el default de la BD
  fecha_completada: string | null;
}

interface Paciente {
  id: string;
  nombre: string;
  creado_en: string;
  asignaciones: Asignacion[];
}

export default async function TerapeutaPanel() {
  const supabase = await createClient()
  
  // Verificación de sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Obtenemos los pacientes asignados a este terapeuta.
  // Usamos "asignaciones:actividades_asignadas" para renombrar la relación y hacer match con la interfaz.
  const { data, error } = await supabase
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
    .eq('terapeuta_id', user.id)
    .order('nombre')

  // Forzamos el tipado estricto de los datos devueltos por Supabase
  const pacientes = (data || []) as unknown as Paciente[];

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera Responsiva */}
        <header className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-center border border-gray-100 gap-4">
          <div className="w-full md:w-auto text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-800">Panel Terapéutico</h1>
            <p className="text-gray-500 text-sm">Directorio de pacientes y seguimiento</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Nuevo acceso directo al Banco de Actividades */}
            <Link 
              href="/terapeuta/banco-actividades"
              className="w-full sm:w-auto bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">📚</span> Banco de Actividades
            </Link>
            
            <form action={logout} className="w-full sm:w-auto">
              <button className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors">
                Cerrar Sesión
              </button>
            </form>
          </div>
        </header>

        {/* Manejo de errores visual sin romper la aplicación */}
        {error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 mb-6 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold">Error al cargar pacientes</h3>
              <p className="text-sm opacity-80">{error.message}</p>
            </div>
          </div>
        ) : (
          <DirectorioPacientes pacientesIniciales={pacientes} />
        )}

      </div>
    </main>
  )
}