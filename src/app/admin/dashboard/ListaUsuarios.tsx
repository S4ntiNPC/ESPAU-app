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
      <div className="bg-red-50 p-5 rounded-2xl text-red-600 border border-red-100 text-sm font-bold flex items-center gap-3 shadow-sm">
        <span className="text-xl">⚠️</span> 
        Error al cargar la lista de usuarios: {error.message}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Contenedor principal con la UI de ESPAU */}
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        
        {/* Envoltorio que habilita el scroll horizontal de forma segura */}
        <div className="overflow-x-auto">
          
          {/* Forzamos un ancho mínimo para que las celdas no se aplasten en móviles */}
          <table className="w-full text-sm text-left text-gray-600 min-w-[600px]">
            <thead className="text-xs text-espau-navy uppercase tracking-wider bg-espau-bgStart/50 border-b border-espau-blue/10">
              <tr>
                <th scope="col" className="px-5 py-4 font-bold">
                  Nombre Completo
                </th>
                <th scope="col" className="px-5 py-4 font-bold">
                  Rol
                </th>
                {/* Eliminamos el 'hidden'. La columna siempre se renderiza para evitar el desfase */}
                <th scope="col" className="px-5 py-4 font-bold">
                  Fecha de Alta
                </th>
                <th scope="col" className="px-5 py-4 font-bold text-right">
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
                    <span className="text-3xl block mb-2">👥</span>
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