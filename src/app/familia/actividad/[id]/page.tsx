import { createClient } from '../../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import ActividadInteractiva from './ActividadInteractiva'

// Interfaces para tipado seguro
interface BancoInfo {
  titulo: string;
  explicacion: string;
  tips_extra: string | null;
  apoyos_visuales_url: string | null;
  pregunta_validacion: string | null; // NUEVO CAMPO
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
  
  // 1. Verificamos sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Extraemos el ID de forma segura
  const resolvedParams = await params;
  const actividadId = resolvedParams.id;

  // 3. Buscamos la actividad asignada cruzada con el banco de actividades
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
        <a href="/familia/mis-actividades" className="text-blue-600 font-medium hover:underline">
          Volver a mis actividades
        </a>
      </div>
    )
  }

  // 4. Normalizamos los datos con tipado seguro
  const actividad = data as unknown as ActividadAsignada;
  
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

  // 5. Renderizamos el componente interactivo pasándole los datos reales
  return (
    <ActividadInteractiva 
      actividadId={actividad.id}
      instruccionesPersonalizadas={actividad.instrucciones_personalizadas}
      bancoInfo={bancoInfo}
    />
  )
}