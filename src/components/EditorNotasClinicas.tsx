'use client'

import { useState } from 'react'
import { createClient } from '../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Edit2, Save, X } from 'lucide-react'

interface EditorNotasProps {
  pacienteId: string
  notasIniciales: string | null
}

export default function EditorNotasClinicas({ pacienteId, notasIniciales }: EditorNotasProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notas, setNotas] = useState(notasIniciales || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    
    // Actualizamos el campo expediente_clinico en la tabla pacientes
    const { error } = await supabase
      .from('pacientes')
      .update({ expediente_clinico: notas })
      .eq('id', pacienteId)

    setLoading(false)

    if (error) {
      console.error('Error al guardar:', error.message)
      alert('Hubo un error al guardar las notas.')
      return
    }

    setIsEditing(false)
    router.refresh() // Refresca la ruta para que los Server Components obtengan la nueva info
  }

  if (isEditing) {
    return (
      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-blue-900 font-semibold">Editando Notas Clínicas</h3>
        </div>
        <textarea
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[150px] text-gray-700"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Escribe aquí el diagnóstico, observaciones o notas relevantes..."
          autoFocus
        />
        <div className="flex gap-2 mt-3 justify-end">
          <button
            onClick={() => {
              setNotas(notasIniciales || '')
              setIsEditing(false)
            }}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50/40 p-5 rounded-xl border border-blue-100 relative group transition-all hover:bg-blue-50/80">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-blue-900 font-semibold text-lg">Notas Clínicas / Diagnóstico</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1 text-sm text-blue-600 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <Edit2 className="w-4 h-4" />
          Editar
        </button>
      </div>
      {notasIniciales ? (
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {notasIniciales}
        </p>
      ) : (
        <p className="text-gray-500 italic">
          Sin notas clínicas registradas en el sistema.
        </p>
      )}
    </div>
  )
}