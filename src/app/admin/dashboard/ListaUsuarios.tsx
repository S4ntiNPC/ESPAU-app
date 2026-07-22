import { createClient } from '../../../utils/supabase/server'
import FilaUsuario from './FilaUsuario' // <-- Importamos el nuevo componente

export default async function ListaUsuarios() {
  const supabase = await createClient()

  const { data: usuarios, error } = await supabase
    .from('perfiles')
    .select('id, nombre, apellidos, rol, creado_en') 
    .order('creado_en', { ascending: false })

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600 mt-6">
        Error al cargar la lista de usuarios: {error.message}
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mt-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Usuarios Registrados</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre Completo</th>
              <th scope="col" className="px-6 py-3">Rol</th>
              <th scope="col" className="px-6 py-3">Fecha de Alta</th>
              <th scope="col" className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios?.map((usuario) => (
              /* En lugar de renderizar el <tr> aquí, delegamos el trabajo al componente cliente */
              <FilaUsuario key={usuario.id} usuario={usuario} />
            ))}

            {usuarios?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay usuarios registrados en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}