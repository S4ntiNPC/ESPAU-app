import { createClient } from '../../../utils/supabase/server'
import { logout } from '../../login/actions'
import { redirect } from 'next/navigation'
import ActividadCard from './ActividadCard'

interface BancoActividadesInfo {
  titulo: string;
  explicacion: string;
  apoyos_visuales_url: string | null;
}

interface ActividadAsignada {
  id: string;
  estado: 'pendiente' | 'completada' | 'incompleta';
  fecha_asignada: string;
  banco_actividades: BancoActividadesInfo | BancoActividadesInfo[] | null;
}

interface Paciente {
  id: string;
  nombre: string;
  actividades_asignadas: ActividadAsignada[];
}

export default async function FamiliaMisActividades() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('pacientes')
    .select(`
      id,
      nombre,
      actividades_asignadas (
        id,
        estado,
        fecha_asignada,
        banco_actividades (
          titulo,
          explicacion,
          apoyos_visuales_url
        )
      )
    `)
    .eq('familia_id', user.id)
    .single();

  const paciente = data as unknown as Paciente;

  // ESTADO: Sin paciente asignado (Manejo de errores amigable)
  if (error || !paciente) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-soft text-center max-w-sm border border-white/50">
          <span className="text-5xl block mb-4">🧩</span>
          <h2 className="text-xl font-extrabold text-espau-navy mb-2">¡Casi listos!</h2>
          <p className="text-gray-500 mb-8 font-medium text-sm leading-relaxed">
            Aún estamos preparando el expediente de tu pequeño. Por favor, avísale a tu terapeuta en la próxima sesión para que vincule tu cuenta.
          </p>
          <form action={logout}>
            <button className="w-full bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-100 active:scale-[0.98] transition-all">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Ordenar cronológicamente (más recientes primero)
  const actividades = paciente.actividades_asignadas || [];
  actividades.sort((a, b) => new Date(b.fecha_asignada).getTime() - new Date(a.fecha_asignada).getTime());

  // Separar listas para dar prioridad visual a lo que falta por hacer[cite: 1]
  const pendientes = actividades.filter(a => a.estado === 'pendiente' || a.estado === 'incompleta');
  const completadas = actividades.filter(a => a.estado === 'completada');

  const normalizarActividad = (act: ActividadAsignada) => {
    let bancoInfo = null;
    if (act.banco_actividades) {
      bancoInfo = Array.isArray(act.banco_actividades) 
        ? act.banco_actividades[0] 
        : act.banco_actividades;
    }
    return {
      id: act.id,
      estado: act.estado,
      banco_actividades: bancoInfo
    };
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 font-sans flex justify-center">
      {/* Contenedor tipo "App" restringido en ancho para mejor UX */}
      <div className="w-full max-w-lg space-y-6">
        
        {/* HEADER: Bienvenida empática */}
        <header className="bg-white rounded-3xl shadow-soft p-6 border border-white/50 flex justify-between items-start">
          <div className="pr-4">
            <h1 className="text-2xl font-extrabold text-espau-navy">¡Hola! 👋</h1>
            <p className="text-gray-500 font-medium mt-1.5 leading-relaxed text-sm">
              Aquí está el plan de hoy para seguir apoyando a <span className="font-bold text-espau-pink">{paciente.nombre}</span> en casa.
            </p>
          </div>
          <form action={logout}>
            <button 
              className="shrink-0 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 p-2 rounded-full transition-colors border border-transparent hover:border-red-100"
              title="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </header>

        {/* SECCIÓN PRINCIPAL: ¿Qué me toca hacer hoy?[cite: 1] */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-extrabold text-lg text-espau-navy">Tu plan para hoy</h2>
            <span className="bg-espau-blue text-white text-xs font-bold px-3 py-1 rounded-full">
              {pendientes.length} {pendientes.length === 1 ? 'tarea' : 'tareas'}
            </span>
          </div>

          {pendientes.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl shadow-soft border border-white/50 text-center flex flex-col items-center">
              <span className="text-6xl mb-4">🎉</span>
              <h3 className="font-extrabold text-espau-navy text-lg mb-2">¡Misión cumplida!</h3>
              <p className="text-gray-500 text-sm font-medium">No tienes actividades pendientes. ¡Tómense un merecido descanso!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendientes.map((actividad) => (
                <ActividadCard key={actividad.id} actividad={normalizarActividad(actividad)} />
              ))}
            </div>
          )}
        </section>

        {/* SECCIÓN SECUNDARIA: Historial atenuado */}
        {completadas.length > 0 && (
          <section className="pt-4">
            <h2 className="font-bold text-gray-400 mb-4 px-2 uppercase tracking-wider text-xs">
              Actividades Completadas
            </h2>
            <div className="space-y-3 opacity-70 hover:opacity-100 transition-opacity">
              {completadas.map((actividad) => (
                <ActividadCard key={actividad.id} actividad={normalizarActividad(actividad)} />
              ))}
            </div>
          </section>
        )}

        {/* TEASER DE GAMIFICACIÓN: Futuras rachas y niveles[cite: 2] */}
        <div className="mt-8 bg-gradient-to-r from-espau-pink/10 to-espau-blue/10 p-5 rounded-3xl border border-white/50 text-center flex items-center justify-center gap-3 shadow-sm">
           <span className="text-2xl animate-bounce">⭐</span>
           <p className="text-espau-navy font-bold text-sm">
             Próximamente: ¡Gana puntos y sube de nivel con cada tarea!
           </p>
        </div>

      </div>
    </main>
  )
}