import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FilaActividad from './FilaActividad'

export default async function AdminBancoActividades() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Extraemos las actividades
  const { data: actividades, error } = await supabase
    .from('banco_actividades')
    .select('*')
    .order('creado_en', { ascending: false })

  if (error) {
    console.error('Error cargando actividades:', error)
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* HEADER: Consistente con el layout del Dashboard y optimizado para móvil */}
        <header className="bg-white rounded-3xl shadow-soft p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-white/50">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-espau-navy tracking-tight">
              Banco de Actividades
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              Gestiona el catálogo general y las encuestas de validación.
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <Link 
              href="/admin/dashboard" 
              className="flex items-center justify-center w-full sm:w-auto text-center bg-gray-50 text-gray-700 hover:bg-gray-100 px-6 py-3.5 rounded-xl font-semibold transition-all border border-gray-200 active:scale-[0.98]"
            >
              <span className="mr-2">&larr;</span> Volver al Panel
            </Link>
          </div>
        </header>

        {/* CONTENEDOR DE LA TABLA: Responsive Degradation para móviles */}
        <div className="w-full">
          <div className="overflow-hidden bg-white rounded-3xl shadow-soft border border-white/50">
            {/* Header interno de la tabla para acciones futuras (ej. Botón de "Crear Nueva") */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-espau-navy">Actividades Registradas</h2>
              <Link
                href="/admin/banco-actividades/crear"
                className="text-sm font-semibold text-white bg-espau-blue hover:bg-opacity-90 px-4 py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-sm"
              >
                + Nueva Actividad
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-espau-navy uppercase tracking-wider bg-espau-bgStart/50 border-b border-espau-blue/10">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold min-w-[200px]">
                      Título
                    </th>
                    {/* Esta columna suele ser larga, le damos un ancho mínimo */}
                    <th scope="col" className="px-6 py-4 font-bold min-w-[250px]">
                      Pregunta de Validación
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {actividades?.map((actividad) => (
                    <FilaActividad key={actividad.id} actividad={actividad} />
                  ))}
                  
                  {(!actividades || actividades.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center text-gray-500 font-medium bg-gray-50/50">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <span className="text-4xl">📂</span>
                          <p>No hay actividades registradas en el banco aún.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}