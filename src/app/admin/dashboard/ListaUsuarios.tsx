import { createClient } from '../../../utils/supabase/server'
import FilaUsuario from './FilaUsuario'

export default async function ListaUsuarios() {
  const supabase = await createClient()

  const { data: usuarios, error } = await supabase
    .from('perfiles')
    .select('id, nombre, apellidos, rol, creado_en') 
    .order('creado_en', { ascending: false })

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-xl text-red-600 border border-red-100 text-sm font-medium">
        Error al cargar la lista de usuarios: {error.message}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-espau-navy uppercase tracking-wider bg-espau-bgStart/50 border-b border-espau-blue/10">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-4 font-bold">
                  Nombre Completo
                </th>
                <th scope="col" className="px-4 sm:px-6 py-4 font-bold">
                  Rol
                </th>
                {/* Ocultamos la fecha en móviles para evitar scroll horizontal y reducir fricción */}
                <th scope="col" className="px-4 sm:px-6 py-4 font-bold hidden sm:table-cell">
                  Fecha de Alta
                </th>
                <th scope="col" className="px-4 sm:px-6 py-4 font-bold text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios?.map((usuario) => (
                <FilaUsuario key={usuario.id} usuario={usuario} />
              ))}

              {usuarios?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium bg-gray-50/50">
                    No hay usuarios registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}