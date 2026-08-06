'use client'

import { useState } from 'react'
import Link from 'next/link'

// Interfaces
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

  // Buscador y filtros del directorio de pacientes
  const pacientesFiltrados = pacientesIniciales.filter(paciente => 
    paciente.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  // Lógica MVP para detectar inactividad (cero tareas completadas)
  const esInactivo = (asignaciones: Asignacion[]) => {
    if (!asignaciones || asignaciones.length === 0) return true;
    const tareasCompletadas = asignaciones.filter(a => a.estado === 'completada')
    if (tareasCompletadas.length === 0) return true;
    return false;
  }

  return (
    <div className="bg-transparent p-1 sm:p-2">
      {/* Encabezado y Buscador */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-espau-navy">
            Mis Pacientes ({pacientesFiltrados.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            Directorio exclusivo de tus casos asignados.
          </p>
        </div>
        
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-base placeholder:text-gray-400"
          />
          <span className="absolute left-4 top-3.5 text-lg opacity-50">🔍</span>
        </div>
      </div>

      {/* Grid de Pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {pacientesFiltrados.map((paciente) => {
          const inactivo = esInactivo(paciente.asignaciones);
          
          return (
            <div key={paciente.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-soft transition-all relative flex flex-col justify-between group">
              
              <div className="mb-6">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-bold text-lg text-espau-navy leading-tight pr-2">
                    {paciente.nombre}
                  </h3>
                  
                  {/* Alertas visuales de inactividad de pacientes claras y sin depender de "hover" */}
                  {inactivo && (
                    <span className="shrink-0 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      Alerta
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  {paciente.asignaciones?.length || 0} actividades asignadas
                </p>
              </div>
              
              {/* Botones de acción (Mobile-First: apilables si el espacio es reducido) */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <Link 
                  href={`/terapeuta/paciente/${paciente.id}`}
                  className="flex-1 bg-espau-bgStart/50 text-espau-blue font-semibold py-3.5 rounded-xl text-sm hover:bg-espau-bgStart transition-colors text-center active:scale-[0.98]"
                >
                  Ver Expediente
                </Link>
                <Link 
                  href={`/terapeuta/paciente/${paciente.id}/asignar`}
                  className="flex-1 bg-espau-pink/10 text-espau-pink font-semibold py-3.5 rounded-xl text-sm hover:bg-espau-pink/20 transition-colors text-center active:scale-[0.98]"
                >
                  Asignar Tarea
                </Link>
              </div>
            </div>
          )
        })}

        {/* Estado Vacío */}
        {pacientesFiltrados.length === 0 && (
          <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <span className="text-4xl mb-3 block">📭</span>
            <p className="text-gray-500 font-medium">No se encontraron pacientes con ese nombre.</p>
          </div>
        )}
      </div>
    </div>
  )
}