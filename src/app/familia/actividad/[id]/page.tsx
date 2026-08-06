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

  // Tipamos la respuesta directamente desde la query
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
    .single<ActividadAsignada>()

  // ESTADO: Actividad no encontrada (UX Amigable)
  if (error || !data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-soft text-center max-w-sm w-full border border-white/50">
          <span className="text-5xl block mb-4">🔍</span>
          <h2 className="text-xl font-extrabold text-espau-navy mb-2">¡Ups!</h2>
          <p className="text-gray-500 mb-8 font-medium leading-relaxed">
            No logramos encontrar esta actividad. Es posible que ya no esté disponible.
          </p>
          <Link 
            href="/familia/mis-actividades" 
            className="block w-full bg-espau-blue text-white px-6 py-3.5 rounded-xl font-bold hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-sm"
          >
            Volver a mi plan
          </Link>
        </div>
      </main>
    )
  }

  const actividad = data;
  
  // BLOQUEO MVP: Pantalla de éxito y felicitación si ya está completada[cite: 2].
  if (actividad.estado === 'completada') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-soft text-center max-w-sm w-full border border-white/50 relative overflow-hidden">
          {/* Detalle visual superior */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-espau-pink to-espau-blue"></div>
          
          <span className="text-6xl block mb-6 animate-bounce">🌟</span>
          
          <h1 className="text-2xl font-extrabold text-espau-navy mb-3">¡Misión Cumplida!</h1>
          <p className="text-gray-500 mb-8 font-medium leading-relaxed">
            Ya enviaste la evidencia de esta actividad. ¡Excelente trabajo apoyando la terapia en casa!
          </p>
          
          <Link 
            href="/familia/mis-actividades" 
            className="block w-full bg-espau-blue text-white font-bold py-3.5 rounded-xl hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-sm"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  // Normalización segura de la información del banco
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

  // Renderizamos el componente cliente que manejará el flujo paso a paso
  return (
    <ActividadInteractiva 
      actividadId={actividad.id}
      instruccionesPersonalizadas={actividad.instrucciones_personalizadas}
      bancoInfo={bancoInfo}
    />
  )
}