'use client'

import { useState } from 'react'
import { editarUsuario, eliminarUsuario } from '../actions'

interface Usuario {
  id: string
  nombre: string
  apellidos: string
  rol: string
  creado_en: string
}

export default function FilaUsuario({ usuario }: { usuario: Usuario }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEditSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const respuesta = await editarUsuario(formData)
    if (respuesta?.error) {
      setError(respuesta.error)
    } else {
      setIsEditModalOpen(false)
    }
    setLoading(false)
  }

  async function handleDelete() {
    setLoading(true)
    setError(null)
    const respuesta = await eliminarUsuario(usuario.id)
    if (respuesta?.error) {
      setError(respuesta.error)
      setLoading(false)
    } else {
      setIsDeleteModalOpen(false)
      // No hacemos setLoading(false) aquí porque el componente se va a desmontar (se elimina la fila)
    }
  }

  return (
    <tr className="bg-white border-b hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
        {usuario.nombre} {usuario.apellidos}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
          ${usuario.rol === 'admin' ? 'bg-purple-100 text-purple-700' : ''}
          ${usuario.rol === 'terapeuta' ? 'bg-blue-100 text-blue-700' : ''}
          ${usuario.rol === 'familia' ? 'bg-green-100 text-green-700' : ''}
        `}>
          {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4">
        {new Date(usuario.creado_en).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
      </td>
      
      <td className="px-6 py-4 text-right space-x-3">
        <button onClick={() => setIsEditModalOpen(true)} className="font-medium text-blue-600 hover:underline">
          Editar
        </button>
        <button onClick={() => setIsDeleteModalOpen(true)} className="font-medium text-red-600 hover:underline">
          Eliminar
        </button>

        {/* MODAL DE EDICIÓN */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-left">Editar Usuario</h3>
              <form action={handleEditSubmit} className="space-y-4 text-left">
                <input type="hidden" name="id" value={usuario.id} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre(s)</label>
                  <input type="text" name="nombre" defaultValue={usuario.nombre} required className="w-full border rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                  <input type="text" name="apellidos" defaultValue={usuario.apellidos} required className="w-full border rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select name="rol" defaultValue={usuario.rol} required className="w-full border rounded-md p-2 bg-white">
                    <option value="terapeuta">Terapeuta</option>
                    <option value="familia">Familia / Cuidador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                {error && <div className="p-3 rounded-md text-sm bg-red-50 text-red-600">{error}</div>}
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium">Cancelar</button>
                  <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE ELIMINACIÓN (NUEVO) */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl text-left">
              <h3 className="text-lg font-bold text-red-600 mb-2">Eliminar Usuario</h3>
              <p className="text-gray-600 text-sm mb-4">
                ¿Estás seguro de que deseas eliminar permanentemente a <strong>{usuario.nombre} {usuario.apellidos}</strong>? Esta acción no se puede deshacer y borrará su acceso a la plataforma.
              </p>
              {error && <div className="p-3 mb-4 rounded-md text-sm bg-red-50 text-red-600">{error}</div>}
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} disabled={loading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium">
                  Cancelar
                </button>
                <button type="button" onClick={handleDelete} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                  {loading ? 'Eliminando...' : 'Sí, eliminar usuario'}
                </button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  )
}