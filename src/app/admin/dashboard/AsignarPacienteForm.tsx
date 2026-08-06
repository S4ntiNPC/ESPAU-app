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

  // Clases compartidas para consistencia y accesibilidad táctil
  const inputClasses = "w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-base placeholder:text-gray-400";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5 ml-1";

  return (
    <div className="bg-transparent p-1">
      <p className="text-sm text-gray-600 mb-6 font-medium">
        Crea el expediente del menor y vincúlalo inmediatamente con su especialista y su apoyo en casa.
      </p>
      
      <form ref={formRef} action={handleSubmit} className="space-y-6">
        
        {/* Sección: Datos del Paciente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label className={labelClasses}>
              Nombre del Paciente (Niño/a)
            </label>
            <input 
              type="text" 
              name="nombre" 
              required 
              className={inputClasses} 
              placeholder="Ej. Juanito González" 
            />
          </div>
          
          <div>
            <label className={labelClasses}>
              Fecha de Nacimiento
            </label>
            <input 
              type="date" 
              name="fecha_nacimiento" 
              required 
              className={inputClasses} 
            />
          </div>
        </div>

        {/* Sección: Asignaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label className={labelClasses}>
              Terapeuta Asignado
            </label>
            <select 
              name="terapeuta_id" 
              required 
              className={`${inputClasses} cursor-pointer`}
              defaultValue=""
            >
              <option value="" disabled>Seleccione un terapeuta...</option>
              {terapeutas.map(t => (
                <option key={t.id} value={t.id}>{t.nombre_completo}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={labelClasses}>
              Cuidador Principal (Familia)
            </label>
            <select 
              name="familia_id" 
              required 
              className={`${inputClasses} cursor-pointer`}
              defaultValue=""
            >
              <option value="" disabled>Seleccione un cuidador...</option>
              {familias.map(f => (
                <option key={f.id} value={f.id}>{f.nombre_completo}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Alertas del Sistema */}
        {mensaje && (
          <div className={`p-4 rounded-xl text-sm font-medium text-center border transition-all ${
            mensaje.tipo === 'error' 
              ? 'bg-red-50 text-red-600 border-red-100' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {(terapeutas.length === 0 || familias.length === 0) && !mensaje && (
           <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm font-medium text-center border border-amber-100">
             Debes registrar al menos un terapeuta y un familiar antes de poder asignar un paciente.
           </div>
        )}

        {/* Botón de Acción Principal */}
        <button 
          type="submit" 
          disabled={loading || terapeutas.length === 0 || familias.length === 0}
          className="w-full bg-espau-blue text-white px-4 py-3.5 rounded-xl font-semibold hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm mt-2 md:w-auto md:px-8"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Asignando...
            </span>
          ) : (
            'Asignar Paciente'
          )}
        </button>
      </form>
    </div>
  )
}