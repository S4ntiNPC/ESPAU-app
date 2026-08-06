'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Video, FileText, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import { createClient } from '../../../../utils/supabase/client'
import CargaEvidencia from './CargaEvidencia'
import FormularioSalida from './FormularioSalida'

// Interfaces estrictas
interface BancoInfo {
  titulo: string;
  explicacion: string;
  tips_extra: string | null;
  apoyos_visuales_url: string | null;
  pregunta_validacion: string | null; 
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
  const [paso, setPaso] = useState(1) // 1: Instrucciones, 2: Evidencia/Formulario, 3: Éxito
  
  // Estado para la evidencia multimedia
  const [evidenciaFile, setEvidenciaFile] = useState<File | null>(null)
  
  // Estados de carga y error
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  // Handler que recibe los datos desde el componente FormularioSalida
  const handleEnviarEvidencia = async (datosFormulario: { quienRealizo: string; comoSeSintio: string; validacion: string }) => {
    setGuardando(true)
    setError('')

    try {
      let evidenciaUrl: string | null = null;

      // 1. Si el usuario adjuntó un archivo, lo subimos al Storage de Supabase
      if (evidenciaFile) {
        const fileExt = evidenciaFile.name.split('.').pop();
        const fileName = `${actividadId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('evidencias')
          .upload(fileName, evidenciaFile);

        if (uploadError) {
          throw new Error('No pudimos subir tu archivo. Por favor, verifica tu conexión a internet e intenta de nuevo.');
        }

        const { data: publicUrlData } = supabase.storage
          .from('evidencias')
          .getPublicUrl(fileName);
          
        evidenciaUrl = publicUrlData.publicUrl;
      }

      // 2. Actualizamos el registro de la actividad
      const { error: updateError } = await supabase
        .from('actividades_asignadas')
        .update({ 
          estado: 'completada',
          quien_realizo: datosFormulario.quienRealizo,
          como_se_sintio: datosFormulario.comoSeSintio,
          respuesta_validacion: datosFormulario.validacion.trim(),
          evidencia_url: evidenciaUrl,
          fecha_completada: new Date().toISOString()
        })
        .eq('id', actividadId)

      if (updateError) throw new Error(updateError.message)

      // 3. Pasamos a la pantalla de éxito
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

  // PANTALLA 3: ÉXITO (Diseño Emocional y Recompensante)
  if (paso === 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <div className="w-full max-w-sm">
          <div className="relative mb-8 flex justify-center">
            <div className="absolute inset-0 bg-espau-blue/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
            <CheckCircle2 className="w-28 h-28 text-emerald-500 relative z-10 animate-bounce" />
          </div>
          <h1 className="text-3xl font-extrabold text-espau-navy mb-3">¡Excelente trabajo!</h1>
          <p className="text-gray-500 mb-10 font-medium leading-relaxed">
            Hemos guardado tu evidencia. Cada pequeño paso en casa es un gran avance en su desarrollo.
          </p>
          <button 
            onClick={() => router.push('/familia/mis-actividades')}
            className="w-full bg-espau-blue text-white py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-soft text-lg"
          >
            Volver a mi plan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header Mobile-First con indicador de progreso */}
      <header className="bg-white sticky top-0 z-20 border-b border-gray-100 px-4 py-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => paso === 2 ? setPaso(1) : router.push('/familia/mis-actividades')} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-50 transition-colors text-espau-navy"
            aria-label="Volver"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-espau-navy truncate text-lg">Actividad de hoy</h1>
        </div>
        
        {/* Barra de progreso visual */}
        <div className="flex items-center gap-2 px-1">
          <div className={`h-1.5 flex-1 rounded-full ${paso >= 1 ? 'bg-espau-blue' : 'bg-gray-100'} transition-colors duration-300`}></div>
          <div className={`h-1.5 flex-1 rounded-full ${paso >= 2 ? 'bg-espau-blue' : 'bg-gray-100'} transition-colors duration-300`}></div>
        </div>
        <div className="flex justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <span className={paso >= 1 ? 'text-espau-blue' : ''}>Paso 1: Leer</span>
          <span className={paso >= 2 ? 'text-espau-blue' : ''}>Paso 2: Evidencia</span>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full">
        
        {/* PASO 1: Instrucciones Claras y Empáticas */}
        {paso === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-8">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-white/50">
              <span className="inline-block bg-espau-bgStart text-espau-blue text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider mb-4">
                Instrucciones
              </span>
              <h2 className="text-2xl font-extrabold text-espau-navy mb-4 leading-tight">
                {bancoInfo.titulo}
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                {bancoInfo.explicacion}
              </p>
            </div>

            {/* Mensajes adicionales / Tips extra (Destacados visualmente) */}
            {(bancoInfo.tips_extra || instruccionesPersonalizadas) && (
              <div className="bg-espau-pink/10 border border-espau-pink/20 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FileText className="w-24 h-24 text-espau-pink" />
                </div>
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <span className="text-xl">💡</span>
                  <h3 className="font-bold text-espau-navy">Notas de tu terapeuta</h3>
                </div>
                <div className="relative z-10 space-y-3">
                  {instruccionesPersonalizadas && (
                    <p className="text-sm text-gray-700 font-bold bg-white/60 p-3 rounded-xl">
                      {instruccionesPersonalizadas}
                    </p>
                  )}
                  {bancoInfo.tips_extra && (
                    <p className="text-sm text-gray-600 font-medium">
                      {bancoInfo.tips_extra}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Botón de Apoyo Visual (Si existe) */}
            {bancoInfo.apoyos_visuales_url && (
              <a 
                href={bancoInfo.apoyos_visuales_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-white border-2 border-espau-blue text-espau-blue py-4 px-4 rounded-2xl font-bold hover:bg-espau-bgStart transition-colors shadow-sm active:scale-[0.98]"
              >
                <Video className="w-6 h-6" />
                Ver video de ejemplo
              </a>
            )}

            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setPaso(2);
              }}
              className="w-full bg-espau-blue text-white py-4 rounded-2xl font-bold shadow-soft mt-8 hover:bg-opacity-90 transition-all active:scale-[0.98] text-lg flex items-center justify-center gap-2"
            >
              ¡Entendido, vamos a hacerlo!
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        )}

        {/* PASO 2: Evidencia y Formulario de Salida */}
        {paso === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 pb-8 pt-2">
            
            <div className="bg-espau-bgStart/50 p-5 rounded-2xl border border-espau-blue/10 mb-2">
              <h3 className="font-bold text-espau-navy flex items-center gap-2">
                <span>📸</span> Ahora, sube tu evidencia
              </h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Un video corto o una foto nos ayuda muchísimo a ver su progreso.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-start gap-3 shadow-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* 1. Componente Modular de Carga de Evidencia */}
            <div className="bg-white rounded-3xl shadow-soft p-1">
               <CargaEvidencia onFileSelected={setEvidenciaFile} />
            </div>

            <div className="py-2 flex items-center gap-4">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Casi terminamos</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {/* 2. Componente Modular de Preguntas (Incluye el botón final) */}
            <FormularioSalida 
              onSubmit={handleEnviarEvidencia}
              isSubmitting={guardando}
              preguntaValidacion={bancoInfo.pregunta_validacion}
            />
          </div>
        )}
      </main>
    </div>
  )
}