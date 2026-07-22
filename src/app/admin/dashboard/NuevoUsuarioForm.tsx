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
      formRef.current?.reset() // Limpiamos el formulario
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mt-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Registrar Nuevo Usuario</h2>
      
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        {/* Cambiamos la estructura del grid para acomodar los nuevos campos fluidamente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* NUEVO: Campo de Nombre separado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre(s)</label>
            <input type="text" name="nombre" required className="w-full border rounded-md p-2" />
          </div>

          {/* NUEVO: Campo de Apellidos separado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
            <input type="text" name="apellidos" required className="w-full border rounded-md p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" name="email" required className="w-full border rounded-md p-2" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Temporal</label>
            <input type="text" name="password" required minLength={6} className="w-full border rounded-md p-2" />
          </div>
          
          {/* Hacemos que el Rol ocupe todo el ancho disponible si queda un espacio impar en el grid */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select name="rol" required className="w-full border rounded-md p-2 bg-white">
              <option value="terapeuta">Terapeuta</option>
              <option value="familia">Familia / Cuidador</option>
              <option value="admin">Administrador</option>
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
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 w-full md:w-auto"
        >
          {loading ? 'Creando...' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  )
}