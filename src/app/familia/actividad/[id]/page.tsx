import { createClient } from '../../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ActividadInteractiva from './ActividadInteractiva'

interface BancoInfo {
  titulo: string;
  explicacion: string;
  tips_extra: string | null;
  apoyos_visuales_url: string | null;
  pregunta_validacion: string | null;
}

interface ActividadAsignada {
  id: string;
  estado: string;
  instrucciones_personalizadas: string | null;
  banco_actividades: BancoInfo | BancoInfo[] | null;
}

export default async function PaginaDetalleActividad({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const resolvedParams = await params;
  const actividadId = resolvedParams.id;

  const { data, error } = await supabase
    .from('actividades_asignadas')
    .select(`
      id,
      estado,
      instrucciones_personalizadas,
      banco_actividades (
        titulo,
        explicacion,
        tips_extra,
        apoyos_visuales_url,
        pregunta_validacion
      )
    `)
    .eq('id', actividadId)
    .single()

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-600 mb-4">No se encontró la actividad solicitada.</p>
        <Link href="/familia/mis-actividades" className="text-blue-600 font-medium hover:underline">
          Volver a mis actividades
        </Link>
      </div>
    )
  }

  const actividad = data as unknown as ActividadAsignada;
  
  // BLOQUEO MVP: Si ya está completada, mostramos pantalla de éxito estática
  if (actividad.estado === 'completada') {
    return (
      <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full border border-gray-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Misión Cumplida!</h1>
          <p className="text-gray-600 mb-8">
            Ya enviaste la evidencia de esta actividad. ¡Excelente trabajo apoyando la terapia en casa!
          </p>
          <Link href="/familia/mis-actividades" className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  let bancoInfo: BancoInfo = {
    titulo: 'Actividad sin título',
    explicacion: 'No hay explicación disponible.',
    tips_extra: null,
    apoyos_visuales_url: null,
    pregunta_validacion: null
  };

  if (actividad.banco_actividades) {
    bancoInfo = Array.isArray(actividad.banco_actividades) 
      ? actividad.banco_actividades[0] 
      : actividad.banco_actividades;
  }

  return (
    <ActividadInteractiva 
      actividadId={actividad.id}
      instruccionesPersonalizadas={actividad.instrucciones_personalizadas}
      bancoInfo={bancoInfo}
    />
  )
}