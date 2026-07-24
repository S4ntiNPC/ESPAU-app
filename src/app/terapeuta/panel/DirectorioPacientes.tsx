'use client'

import { useState } from 'react'
import Link from 'next/link' // Importación clave para el enrutamiento

interface Asignacion {
  id: string
  estado: string
  fecha_completada: string | null
}

interface Paciente {
  id: string
  nombre: string
  creado_en: string
  asignaciones: Asignacion[]
}

export default function DirectorioPacientes({ pacientesIniciales }: { pacientesIniciales: Paciente[] }) {
  const [busqueda, setBusqueda] = useState('')

  const pacientesFiltrados = pacientesIniciales.filter(paciente => 
    paciente.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const esInactivo = (asignaciones: Asignacion[]) => {
    if (!asignaciones || asignaciones.length === 0) return true;
    const tareasCompletadas = asignaciones.filter(a => a.estado === 'completada')
    if (tareasCompletadas.length === 0) return true;
    return false;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Mis Pacientes ({pacientesFiltrados.length})</h2>
        
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pacientesFiltrados.map((paciente) => {
          const inactivo = esInactivo(paciente.asignaciones);
          
          return (
            <div key={paciente.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow relative bg-white flex flex-col justify-between">
              <div>
                {inactivo && (
                  <span className="absolute top-4 right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" title="Alerta: Inactividad detectada"></span>
                  </span>
                )}
                
                <h3 className="font-bold text-lg text-gray-800 mb-1 pr-6">{paciente.nombre}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {paciente.asignaciones?.length || 0} actividades asignadas
                </p>
              </div>
              
              {/* CAMBIO AQUÍ: Uso de Link para navegación nativa */}
              <div className="flex gap-2 mt-auto">
                <Link 
                  href={`/terapeuta/paciente/${paciente.id}`}
                  className="flex-1 bg-blue-50 text-blue-700 font-medium py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors text-center inline-block"
                >
                  Ver Expediente
                </Link>
                <Link 
                  href={`/terapeuta/paciente/${paciente.id}/asignar`}
                  className="flex-1 bg-purple-50 text-purple-700 font-medium py-2 rounded-lg text-sm hover:bg-purple-100 transition-colors text-center inline-block"
                >
                  Asignar Tarea
                </Link>
              </div>
            </div>
          )
        })}

        {pacientesFiltrados.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No se encontraron pacientes asignados.
          </div>
        )}
      </div>
    </div>
  )
}