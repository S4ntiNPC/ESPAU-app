'use client'

import { useState } from 'react'
import { createClient } from '../../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'

type ActividadCardProps = {
  actividad: {
    id: string
    estado: 'pendiente' | 'completada' | 'incompleta'
    banco_actividades: {
      titulo: string
      explicacion: string
      apoyos_visuales_url: string | null
    } | null
  }
}

export default function ActividadCard({ actividad }: ActividadCardProps) {
  const [loading, setLoading] = useState(false)
  const [estado, setEstado] = useState(actividad.estado)
  const router = useRouter()
  const supabase = createClient()

  const completada = estado === 'completada'

  const marcarHecha = async () => {
    if (completada || loading) return
    setLoading(true)

    const { error } = await supabase
      .from('actividades_asignadas')
      .update({ estado: 'completada' })
      .eq('id', actividad.id)

    setLoading(false)

    if (error) {
      console.error('No se pudo actualizar la actividad:', error.message)
      return
    }

    setEstado('completada')
    router.refresh()
  }

  return (
    <div
      className={`rounded-2xl p-4 border shadow-sm bg-white flex items-center gap-3 transition-all ${
        completada ? 'border-green-100 opacity-60' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
      }`}
    >
      {/* Botón para marcar como hecha rápidamente */}
      <button
        onClick={marcarHecha}
        disabled={loading}
        aria-label={completada ? 'Actividad completada' : 'Marcar como hecha'}
        className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-50 ${
          completada ? 'bg-green-500 border-green-500' : 'border-gray-300'
        }`}
      >
        {completada && <Check className="w-4 h-4 text-white" />}
      </button>

      {/* Área clickeable que lleva al detalle de la actividad */}
      <Link 
        href={`/familia/actividad/${actividad.id}`}
        className="flex-1 flex items-center justify-between group cursor-pointer outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 p-1 -m-1"
      >
        <div className="pr-2">
          <p className={`font-medium text-gray-900 group-hover:text-blue-600 transition-colors ${completada ? 'line-through' : ''}`}>
            {actividad.banco_actividades?.titulo ?? 'Actividad sin título'}
          </p>

          {actividad.banco_actividades?.explicacion && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
              {actividad.banco_actividades.explicacion}
            </p>
          )}
        </div>
        
        {/* Indicador visual de navegación */}
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors shrink-0" />
      </Link>
    </div>
  )
}