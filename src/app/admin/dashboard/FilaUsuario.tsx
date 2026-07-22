'use client'

import { useState } from 'react'
import { editarUsuario } from '../actions'

interface Usuario {
  id: string
  nombre: string
  apellidos: string
  rol: string
  creado_en: string
}

export default function FilaUsuario({ usuario }: { usuario: Usuario }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const respuesta = await editarUsuario(formData)
    
    if (respuesta?.error) {
      setError(respuesta.error)
      setLoading(false)
    } else {
      setIsModalOpen(false)
      setLoading(false)
    }
  }

  // Ya no usamos el Fragment (<></>) vacío, devolvemos directamente el <tr>
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
        {new Date(usuario.creado_en).toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </td>
      
      {/* SOLUCIÓN: Metemos el botón y el Modal dentro de la misma celda <td> */}
      <td className="px-6 py-4 text-right">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="font-medium text-blue-600 hover:underline"
        >
          Editar
        </button>

        {/* Ventana Modal anidada correctamente dentro del <td> */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-left">Editar Usuario</h3>
              
              <form action={handleSubmit} className="space-y-4 text-left">
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

                {error && (
                  <div className="p-3 rounded-md text-sm bg-red-50 text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </td>
    </tr>
  )
}