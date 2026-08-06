'use client'

import { useRef, useState } from 'react'
import { crearUsuario } from '../actions'

export default function NuevoUsuarioForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'success', texto: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMensaje(null)
    
    const respuesta = await crearUsuario(formData)
    
    if (respuesta?.error) {
      setMensaje({ tipo: 'error', texto: respuesta.error })
    } else if (respuesta?.success) {
      setMensaje({ tipo: 'success', texto: respuesta.success })
      formRef.current?.reset() // Limpiamos el formulario tras éxito
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-transparent p-1 sm:p-2">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-espau-navy">Registrar Nuevo Usuario</h2>
        <p className="text-sm text-gray-500 mt-1.5">
          Completa los datos para dar acceso a la plataforma.
        </p>
      </div>
      
      <form ref={formRef} action={handleSubmit} className="space-y-6">
        {/* Contenedor de Inputs con espaciado uniforme */}
        <div className="space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Nombre(s)
            </label>
            <input 
              type="text" 
              name="nombre" 
              required 
              placeholder="Ej. María"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-base placeholder:text-gray-400" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Apellidos
            </label>
            <input 
              type="text" 
              name="apellidos" 
              required 
              placeholder="Ej. López Pérez"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-base placeholder:text-gray-400" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-base placeholder:text-gray-400" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Contraseña Temporal
            </label>
            <input 
              type="text" 
              name="password" 
              required 
              minLength={6} 
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-base placeholder:text-gray-400" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Rol del Usuario
            </label>
            <select 
              name="rol" 
              required 
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-base cursor-pointer"
            >
              <option value="familia">Familia / Cuidador</option>
              <option value="terapeuta">Terapeuta</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        {/* Feedback de Sistema */}
        {mensaje && (
          <div className={`p-4 rounded-xl text-sm font-medium text-center border transition-all ${
            mensaje.tipo === 'error' 
              ? 'bg-red-50 text-red-600 border-red-100' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Botón de Acción Principal */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-espau-blue text-white px-4 py-3.5 rounded-xl font-semibold hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            'Crear Usuario'
          )}
        </button>
      </form>
    </div>
  )
}