'use client'

import { useRef, useState } from 'react'
import { asignarPaciente } from '../actions/accionesPaciente'

// Definimos las interfaces para TypeScript
interface PerfilBreve {
  id: string
  nombre_completo: string
}

interface Props {
  terapeutas: PerfilBreve[]
  familias: PerfilBreve[]
}

export default function AsignarPacienteForm({ terapeutas, familias }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'success', texto: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMensaje(null)
    
    const respuesta = await asignarPaciente(formData)
    
    if (respuesta?.error) {
      setMensaje({ tipo: 'error', texto: respuesta.error })
    } else if (respuesta?.success) {
      setMensaje({ tipo: 'success', texto: respuesta.success })
      formRef.current?.reset()
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mt-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Alta y Asignación de Paciente</h2>
      
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Paciente (Niño/a)</label>
            <input type="text" name="nombre" required className="w-full border rounded-md p-2" placeholder="Ej. Juanito González" />
          </div>
          
          {/* NUEVO: Campo de Fecha de Nacimiento (Obligatorio en BD) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
            <input type="date" name="fecha_nacimiento" required className="w-full border rounded-md p-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terapeuta Asignado</label>
            <select name="terapeuta_id" required className="w-full border rounded-md p-2 bg-white">
              <option value="">Seleccione un terapeuta...</option>
              {terapeutas.map(t => (
                <option key={t.id} value={t.id}>{t.nombre_completo}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuidador Principal (Familia)</label>
            <select name="familia_id" required className="w-full border rounded-md p-2 bg-white">
              <option value="">Seleccione un cuidador...</option>
              {familias.map(f => (
                <option key={f.id} value={f.id}>{f.nombre_completo}</option>
              ))}
            </select>
          </div>
        </div>

        {mensaje && (
          <div className={`p-3 rounded-md text-sm ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {mensaje.texto}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || terapeutas.length === 0 || familias.length === 0}
          className="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 disabled:opacity-50 w-full md:w-auto"
        >
          {loading ? 'Asignando...' : 'Asignar Paciente'}
        </button>
      </form>
    </div>
  )
}