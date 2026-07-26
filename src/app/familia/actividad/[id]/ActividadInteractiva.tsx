'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Video, FileText, CheckCircle2 } from 'lucide-react'
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
  const [paso, setPaso] = useState(1) // 1: Instrucciones, 2: Formulario y Evidencia, 3: Éxito
  
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
      // (Asegúrate de crear un bucket llamado 'evidencias' en tu proyecto de Supabase)
      if (evidenciaFile) {
        const fileExt = evidenciaFile.name.split('.').pop();
        const fileName = `${actividadId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('evidencias')
          .upload(fileName, evidenciaFile);

        if (uploadError) {
          throw new Error('No se pudo subir el archivo de evidencia. Intenta de nuevo.');
        }

        // Obtenemos la URL pública del archivo subido
        const { data: publicUrlData } = supabase.storage
          .from('evidencias')
          .getPublicUrl(fileName);
          
        evidenciaUrl = publicUrlData.publicUrl;
      }

      // 2. Actualizamos el registro de la actividad en la base de datos
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

      // 3. Si todo sale bien, pasamos a la pantalla de éxito
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
      <div className="min-h-screen bg-[#F4F7FF] flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-24 h-24 text-blue-600 mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Excelente trabajo!</h1>
        <p className="text-gray-600 mb-8 max-w-sm">El terapeuta ha recibido tu actualización. Cada pequeño paso es un gran avance.</p>
        <button 
          onClick={() => router.push('/familia/mis-actividades')}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 w-full max-w-xs transition-colors shadow-md"
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
        <button 
          onClick={() => router.push('/familia/mis-actividades')} 
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Volver"
        >
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
                Ver apoyo visual
              </a>
            )}

            {/* Mensajes adicionales / Tips extra */}
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

        {/* PASO 2: Evidencia y Preguntas de Salida integradas */}
        {paso === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 pt-2">
            
            {/* Mensaje de error general si la subida/guardado falla */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* 1. Componente Modular de Carga de Evidencia */}
            <CargaEvidencia onFileSelected={setEvidenciaFile} />

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
              </div>
            </div>

            {/* 2. Componente Modular de Preguntas (Incluye el botón final) */}
            <FormularioSalida 
              onSubmit={handleEnviarEvidencia}
              isSubmitting={guardando}
              // NUEVO: Pasamos la pregunta específica de esta actividad
              preguntaValidacion={bancoInfo.pregunta_validacion}
            />
          </div>
        )}
      </main>
    </div>
  )
}