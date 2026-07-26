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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-8">
        
        <header className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Administración del Banco de Actividades</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona el catálogo general y las encuestas de validación.</p>
          </div>
          <Link href="/admin/dashboard" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors">
            Volver al Panel
          </Link>
        </header>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Pregunta de Validación</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actividades?.map((actividad) => (
                <FilaActividad key={actividad.id} actividad={actividad} />
              ))}
              {(!actividades || actividades.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No hay actividades registradas en el banco aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  )
}