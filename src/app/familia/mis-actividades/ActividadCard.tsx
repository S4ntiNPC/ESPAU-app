import Link from 'next/link'
import { Check, ChevronRight, Image as ImageIcon, PlayCircle } from 'lucide-react'
import Image from 'next/image'

type ActividadCardProps = {
  actividad: {
    id: string
    estado: 'pendiente' | 'completada' | 'incompleta'
    respuesta_validacion?: string | null // Corregido
    evidencia_url?: string | null
    banco_actividades: {
      titulo: string
      explicacion: string
      apoyos_visuales_url: string | null
      pregunta_validacion?: string | null // Corregido
    } | null
  }
}

export default function ActividadCard({ actividad }: ActividadCardProps) {
  const completada = actividad.estado === 'completada';
  const esVideo = actividad.evidencia_url ? /\.(mp4|webm|ogg|mov)$/i.test(actividad.evidencia_url) : false;

  return (
    <div className={`rounded-2xl border shadow-sm transition-all overflow-hidden ${
      completada ? 'border-green-100 bg-green-50/30' : 'border-gray-100 hover:border-blue-200 hover:shadow-md bg-white'
    }`}>
      <Link 
        href={`/familia/actividad/${actividad.id}`}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 p-4"
      >
        <div className="flex items-start gap-3">
          <div className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
              completada ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-gray-50'
            }`}
          >
            {completada && <Check className="w-4 h-4 text-white" />}
          </div>

          <div className="flex-1 pr-2">
            <p className={`font-medium text-gray-900 transition-colors ${completada ? 'text-green-800' : 'group-hover:text-blue-600'}`}>
              {actividad.banco_actividades?.titulo ?? 'Actividad sin título'}
            </p>

            {actividad.banco_actividades?.explicacion && !completada && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                {actividad.banco_actividades.explicacion}
              </p>
            )}

            {completada && (
              <div className="mt-3 bg-white p-3 rounded-xl border border-green-100 flex gap-3 items-center">
                 {actividad.evidencia_url ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                      {esVideo ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <PlayCircle className="w-6 h-6 text-gray-500" />
                        </div>
                      ) : (
                        <Image src={actividad.evidencia_url} alt="Evidencia" fill className="object-cover" />
                      )}
                    </div>
                 ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                 )}
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 line-clamp-1">
                      {actividad.banco_actividades?.pregunta_validacion || 'Pregunta de validación'}
                    </p>
                    <p className="text-sm text-gray-700 font-medium line-clamp-1 mt-0.5 capitalize">
                      {actividad.respuesta_validacion || 'Sin respuesta'}
                    </p>
                 </div>
              </div>
            )}
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400 transition-colors shrink-0 mt-1" />
        </div>
      </Link>
    </div>
  )
}