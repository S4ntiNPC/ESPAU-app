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

  // Obtenemos los pacientes asignados EXCLUSIVAMENTE a este terapeuta[cite: 2].
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
    <main className="min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Cabecera Responsiva: Mobile-First con botones táctiles accesibles */}
        <header className="bg-white rounded-3xl shadow-soft p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border border-white/50">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-espau-navy tracking-tight">
              Panel Terapéutico
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              Gestiona los expedientes, revisa métricas clínicas y asigna actividades a tus pacientes.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Acceso directo al Banco de Actividades */}
            <Link 
              href="/terapeuta/banco-actividades"
              className="w-full sm:w-auto text-center bg-espau-blue text-white hover:bg-opacity-90 px-6 py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="text-lg">📚</span> Banco de Actividades
            </Link>
            
            <form action={logout} className="w-full sm:w-auto">
              <button className="w-full text-center bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-espau-pink px-6 py-3.5 rounded-xl font-semibold transition-all border border-gray-200 active:scale-[0.98]">
                Cerrar Sesión
              </button>
            </form>
          </div>
        </header>

        {/* Manejo de errores visual sin romper la aplicación (Adaptado a ESPAU UI) */}
        {error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-3xl shadow-soft border border-red-100 flex items-start sm:items-center gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold text-lg">No pudimos cargar tu lista de pacientes</h3>
              <p className="text-sm mt-1 opacity-90">{error.message}</p>
            </div>
          </div>
        ) : (
          /* 
            Contenedor principal donde vivirá el buscador, filtros y las tarjetas de los pacientes.
            Aquí es donde se resaltarán los pacientes con inactividad y sus métricas[cite: 2].
          */
          <section className="bg-white rounded-3xl shadow-soft p-6 sm:p-8 border border-white/50">
             <DirectorioPacientes pacientesIniciales={pacientes} />
          </section>
        )}

      </div>
    </main>
  )
}