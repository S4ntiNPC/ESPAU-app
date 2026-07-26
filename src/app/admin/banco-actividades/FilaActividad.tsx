'use client'

import { useState } from 'react'
import { editarActividad, eliminarActividad } from '../actions'

interface Actividad {
  id: string
  titulo: string
  explicacion: string
  pregunta_validacion: string | null
}

export default function FilaActividad({ actividad }: { actividad: Actividad }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEditSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const respuesta = await editarActividad(formData)
    if (respuesta?.error) {
      setError(respuesta.error)
      setLoading(false)
    } else {
      setIsEditModalOpen(false)
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    setError(null)
    const respuesta = await eliminarActividad(actividad.id)
    if (respuesta?.error) {
      setError(respuesta.error)
      setLoading(false)
    } else {
      setIsDeleteModalOpen(false)
    }
  }

  return (
    <tr className="bg-white border-b hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900">
        {actividad.titulo}
      </td>
      <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
        {actividad.pregunta_validacion || <span className="text-gray-400 italic">Genérica (¿Cómo le fue?)</span>}
      </td>
      <td className="px-6 py-4 text-right space-x-3">
        <button onClick={() => setIsEditModalOpen(true)} className="font-medium text-blue-600 hover:underline">
          Editar
        </button>
        <button onClick={() => setIsDeleteModalOpen(true)} className="font-medium text-red-600 hover:underline">
          Eliminar
        </button>

        {/* MODAL EDITAR ACTIVIDAD */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Editar Actividad</h3>
              <form action={handleEditSubmit} className="space-y-4">
                <input type="hidden" name="id" value={actividad.id} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título de la actividad *</label>
                  <input type="text" name="titulo" defaultValue={actividad.titulo} required className="w-full border rounded-md p-2" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Explicación *</label>
                  <textarea name="explicacion" defaultValue={actividad.explicacion} required rows={3} className="w-full border rounded-md p-2 resize-none" />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                  <label className="block text-sm font-semibold text-blue-900 mb-1">Pregunta de Validación para la Familia</label>
                  <p className="text-xs text-blue-700 mb-2">Edita la pregunta final que responderá el cuidador. Si lo dejas vacío, se usará una genérica.</p>
                  <input type="text" name="pregunta_validacion" defaultValue={actividad.pregunta_validacion || ''} placeholder="Ej: ¿Qué color se le dificultó más?" className="w-full border rounded-md p-2" />
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

        {/* MODAL ELIMINAR ACTIVIDAD */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl text-left">
              <h3 className="text-lg font-bold text-red-600 mb-2">Eliminar Actividad</h3>
              <p className="text-gray-600 text-sm mb-4">
                ¿Estás seguro de que deseas eliminar <strong>{actividad.titulo}</strong> del banco de actividades?
              </p>
              {error && <div className="p-3 mb-4 rounded-md text-sm bg-red-50 text-red-600">{error}</div>}
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} disabled={loading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium">
                  Cancelar
                </button>
                <button type="button" onClick={handleDelete} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 disabled:opacity-50">
                  {loading ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  )
}