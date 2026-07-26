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
  const completada = actividad.estado === 'completada'

  return (
    <Link 
      href={`/familia/actividad/${actividad.id}`}
      className="block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
    >
      <div
        className={`rounded-2xl p-4 border shadow-sm bg-white flex items-center gap-3 transition-all ${
          completada ? 'border-green-100 bg-green-50/30' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
        }`}
      >
        {/* Indicador visual estático (No clickeable independientemente) */}
        <div className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
            completada ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-gray-50'
          }`}
        >
          {completada && <Check className="w-4 h-4 text-white" />}
        </div>

        {/* Información de la actividad */}
        <div className="flex-1 pr-2">
          <p className={`font-medium text-gray-900 transition-colors ${completada ? 'line-through text-gray-500' : 'group-hover:text-blue-600'}`}>
            {actividad.banco_actividades?.titulo ?? 'Actividad sin título'}
          </p>

          {actividad.banco_actividades?.explicacion && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
              {actividad.banco_actividades.explicacion}
            </p>
          )}
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400 transition-colors shrink-0" />
      </div>
    </Link>
  )
}