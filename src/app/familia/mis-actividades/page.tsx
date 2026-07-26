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

  if (error || !paciente) {
    return (
      <main className="min-h-screen bg-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Aún no hay pacientes asignados</h2>
          <p className="text-gray-600 mb-6">Por favor, contacta a la coordinación de ESPAU para que vinculen tu cuenta con el expediente de tu pequeño.</p>
          <form action={logout}>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
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

  // Separar listas
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
    <main className="min-h-screen bg-blue-50 p-4 md:p-8">
      <div className="max-w-md mx-auto md:max-w-2xl bg-white rounded-2xl shadow-sm overflow-hidden pb-8">
        
        <header className="bg-blue-600 p-6 text-white flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">¡Hola! 👋</h1>
            <p className="opacity-90 mt-1">
              Aquí está el plan de hoy para reforzar la terapia de <b>{paciente.nombre}</b> en casa.
            </p>
          </div>
          <form action={logout}>
            <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
              Salir
            </button>
          </form>
        </header>

        <div className="p-6">
          {/* SECCIÓN 1: PENDIENTES */}
          <section className="mb-8">
            <h2 className="font-semibold text-gray-700 mb-4 text-lg">Actividades Asignadas</h2>
            {pendientes.length === 0 ? (
              <div className="text-center py-8 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-100">
                <p className="text-gray-500">No hay actividades asignadas por el momento.</p>
                <p className="text-sm text-gray-400 mt-1">¡Tómense un merecido descanso!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendientes.map((actividad) => (
                  <ActividadCard key={actividad.id} actividad={normalizarActividad(actividad)} />
                ))}
              </div>
            )}
          </section>

          {/* SECCIÓN 2: COMPLETADAS */}
          {completadas.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-700 mb-4 text-lg border-t pt-6">Actividades Completadas</h2>
              <div className="space-y-3 opacity-80">
                {completadas.map((actividad) => (
                  <ActividadCard key={actividad.id} actividad={normalizarActividad(actividad)} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
            <p className="text-orange-600 font-medium text-sm">
              🔥 Próximamente: ¡Aquí verás tus rachas y niveles!
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}