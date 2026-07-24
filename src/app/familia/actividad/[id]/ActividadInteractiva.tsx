'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, CheckCircle2, Video, FileText, Loader2 } from 'lucide-react'
import { createClient } from '../../../../utils/supabase/client'

// Interfaces estrictas
interface BancoInfo {
  titulo: string;
  explicacion: string;
  tips_extra: string | null;
  apoyos_visuales_url: string | null;
  pregunta_validacion: string | null; // NUEVO CAMPO
}

interface Props {
  actividadId: string;
  instruccionesPersonalizadas: string | null;
  bancoInfo: BancoInfo;
}

export default function ActividadInteractiva({ actividadId, instruccionesPersonalizadas, bancoInfo }: Props) {
  const router = useRouter()
  const supabase = createClient()
  
  // Estados del flujo
  const [paso, setPaso] = useState(1) // 1: Instrucciones, 2: Formulario, 3: Éxito
  
  // Estados del formulario de salida
  const [quienRealizo, setQuienRealizo] = useState('')
  const [comoSeSintio, setComoSeSintio] = useState('')
  const [respuestaValidacion, setRespuestaValidacion] = useState('') // NUEVO ESTADO
  
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleEnviarEvidencia = async () => {
    // Validación de las 3 preguntas (La tercera es obligatoria solo si el terapeuta la configuró)
    if (!quienRealizo || !comoSeSintio || (bancoInfo.pregunta_validacion && !respuestaValidacion.trim())) {
      setError('Por favor, responde todas las preguntas para poder avanzar y registrar tu progreso.')
      return
    }

    setGuardando(true)
    setError('')

    try {
      // Actualizamos el registro en la base de datos
      const { error: updateError } = await supabase
        .from('actividades_asignadas')
        .update({ 
          estado: 'completada',
          quien_realizo: quienRealizo,
          como_se_sintio: comoSeSintio,
          respuesta_validacion: respuestaValidacion.trim() || null, // GUARDAMOS LA RESPUESTA
          fecha_completada: new Date().toISOString()
        })
        .eq('id', actividadId)

      if (updateError) throw new Error(updateError.message)

      // Si todo sale bien, pasamos a la pantalla de éxito
      setPaso(3)
      router.refresh() 
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error al guardar. Intenta de nuevo.')
      }
      setGuardando(false)
    }
  }

  // PANTALLA 3: ÉXITO
  if (paso === 3) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold text-green-800 mb-2">¡Excelente trabajo!</h1>
        <p className="text-green-600 mb-8">El terapeuta ha recibido tu actualización. Cada pequeño paso es un gran avance.</p>
        <button 
          onClick={() => router.push('/familia/mis-actividades')}
          className="bg-green-600 text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 w-full max-w-xs transition-colors"
        >
          Volver a mis actividades
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header fijo */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-200 px-4 py-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => router.push('/familia/mis-actividades')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900 truncate">Detalle de Actividad</h1>
      </header>

      <main className="p-5 max-w-md mx-auto">
        {/* PASO 1: Explicación */}
        {paso === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">Instrucciones</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{bancoInfo.titulo}</h2>
              <p className="mt-3 text-gray-600 leading-relaxed whitespace-pre-wrap">{bancoInfo.explicacion}</p>
            </div>

            {/* Botón de Apoyo Visual */}
            {bancoInfo.apoyos_visuales_url && (
              <a 
                href={bancoInfo.apoyos_visuales_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-blue-100 text-blue-700 py-3 px-4 rounded-xl font-semibold hover:bg-blue-200 transition-colors shadow-sm"
              >
                <Video className="w-5 h-5" />
                Ver apoyo visual / Video
              </a>
            )}

            {/* Mostramos tips extra del banco O instrucciones personalizadas del terapeuta */}
            {(bancoInfo.tips_extra || instruccionesPersonalizadas) && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Mensaje del Terapeuta</h3>
                </div>
                {instruccionesPersonalizadas && (
                  <p className="text-sm text-blue-800 mb-2 font-medium">{instruccionesPersonalizadas}</p>
                )}
                {bancoInfo.tips_extra && (
                  <p className="text-sm text-blue-800 opacity-90">{bancoInfo.tips_extra}</p>
                )}
              </div>
            )}

            <button 
              onClick={() => setPaso(2)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium shadow-md shadow-blue-200 mt-8 hover:bg-blue-700 transition-colors"
            >
              Comenzar Actividad
            </button>
          </div>
        )}

        {/* PASO 2: Evidencia y Preguntas de Salida */}
        {paso === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <section>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">1. Sube tu evidencia (Opcional)</h3>
              <p className="text-sm text-gray-500 mb-4">Graba directamente o sube un archivo corto.</p>
              
              <label className="border-2 border-dashed border-gray-300 bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Video className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <span className="text-blue-600 font-medium">Toca para seleccionar</span>
                </div>
                <input type="file" accept="video/*,image/*" className="hidden" onChange={() => console.log("Archivo seleccionado en MVP")} />
              </label>
            </section>

            <hr className="border-gray-200" />

            <section className="space-y-6">
              <h3 className="font-bold text-gray-900 text-lg">2. Preguntas de salida</h3>
              
              {/* Pregunta 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Quién realizó la actividad con el niño? *</label>
                <select 
                  value={quienRealizo}
                  onChange={(e) => setQuienRealizo(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Mamá">Mamá</option>
                  <option value="Papá">Papá</option>
                  <option value="Abuelo/a">Abuelo/a</option>
                  <option value="Tío/a">Tío/a</option>
                  <option value="Otro">Otro cuidador</option>
                </select>
              </div>

              {/* Pregunta 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo te sentiste durante el ejercicio? *</label>
                <div className="flex justify-between gap-2">
                  {['Frustrado', 'Normal', 'Feliz', 'Excelente'].map((emocion) => (
                    <button 
                      key={emocion} 
                      onClick={() => setComoSeSintio(emocion)}
                      className={`flex-1 py-2 px-1 border rounded-lg text-xs font-medium transition-colors ${
                        comoSeSintio === emocion 
                          ? 'bg-blue-100 border-blue-500 text-blue-800 ring-2 ring-blue-500 ring-offset-1' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {emocion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregunta 3 (Condicional) */}
              {bancoInfo.pregunta_validacion && (
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    {bancoInfo.pregunta_validacion} *
                  </label>
                  <textarea 
                    value={respuestaValidacion}
                    onChange={(e) => setRespuestaValidacion(e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    className="w-full bg-white border border-blue-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-none h-24"
                  />
                </div>
              )}
            </section>

            <button 
              onClick={handleEnviarEvidencia}
              disabled={guardando}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium shadow-md shadow-blue-200 mt-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" /> Enviar y Finalizar
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}