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

  // Clases compartidas optimizadas para evitar desbordamientos en móviles
  const inputClasses = "w-full min-w-0 px-3 sm:px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-sm sm:text-base placeholder:text-gray-400";
  const labelClasses = "block text-sm font-bold text-espau-navy mb-1.5 ml-1";

  return (
    <div className="bg-transparent p-1 sm:p-2">
      <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
        Crea el expediente del menor y vincúlalo inmediatamente con su especialista y su apoyo en casa[cite: 2].
      </p>
      
      <form ref={formRef} action={handleSubmit} className="space-y-5 sm:space-y-6">
        
        {/* Sección: Datos del Paciente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div className="min-w-0">
            <label className={labelClasses}>
              Nombre del Paciente (Niño/a) <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="nombre" 
              required 
              className={inputClasses} 
              placeholder="Ej. Juanito González" 
              disabled={loading}
            />
          </div>
          
          <div className="min-w-0">
            <label className={labelClasses}>
              Fecha de Nacimiento <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              name="fecha_nacimiento" 
              required 
              // appearance-none y text-gray-700 aseguran que en iOS se vea correctamente sin desbordar
              className={`${inputClasses} appearance-none text-gray-700`} 
              disabled={loading}
            />
          </div>
        </div>

        {/* Sección: Asignaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div className="min-w-0">
            <label className={labelClasses}>
              Terapeuta Asignado <span className="text-red-500">*</span>
            </label>
            <select 
              name="terapeuta_id" 
              required 
              className={`${inputClasses} cursor-pointer truncate`}
              defaultValue=""
              disabled={loading}
            >
              <option value="" disabled>Seleccione un terapeuta...</option>
              {terapeutas.map(t => (
                <option key={t.id} value={t.id}>{t.nombre_completo}</option>
              ))}
            </select>
          </div>
          
          <div className="min-w-0">
            <label className={labelClasses}>
              Cuidador Principal (Familia) <span className="text-red-500">*</span>
            </label>
            <select 
              name="familia_id" 
              required 
              className={`${inputClasses} cursor-pointer truncate`}
              defaultValue=""
              disabled={loading}
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
          <div className={`p-4 rounded-xl text-sm font-bold text-center border transition-all shadow-sm ${
            mensaje.tipo === 'error' 
              ? 'bg-red-50 text-red-600 border-red-100' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Bloqueo preventivo si faltan catálogos */}
        {(terapeutas.length === 0 || familias.length === 0) && !mensaje && (
           <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm font-bold border border-amber-100 flex items-start gap-3 shadow-sm">
             <span className="text-lg">⚠️</span>
             <p>Debes registrar al menos un terapeuta y un familiar antes de poder asignar un paciente.</p>
           </div>
        )}

        {/* Botón de Acción Principal */}
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading || terapeutas.length === 0 || familias.length === 0}
            className="w-full md:w-auto md:px-10 bg-espau-blue text-white py-3.5 rounded-xl font-bold hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Asignando paciente...
              </>
            ) : (
              'Asignar Paciente'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}