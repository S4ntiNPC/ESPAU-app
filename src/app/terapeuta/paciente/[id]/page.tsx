import Link from 'next/link';
import { createClient } from '../../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import EditorNotasClinicas from '../../../../components/EditorNotasClinicas';

// 1. DEFINICIÓN DE INTERFACES ESTRICTAS
interface BancoActividad {
  titulo: string;
}

interface ActividadAsignada {
  id: string;
  estado: string;
  fecha_asignada: string;
  fecha_completada: string | null;
  feedback_terapeuta: string | null;
  quien_realizo: string | null;
  como_se_sintio: string | null;
  instrucciones_personalizadas: string | null;
  banco_actividades: BancoActividad | BancoActividad[] | null; 
}

interface Paciente {
  id: string;
  nombre: string;
  fecha_nacimiento: string;
  expediente_clinico: string | null;
  actividades_asignadas: ActividadAsignada[];
}

export default async function ExpedientePaciente({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const resolvedParams = await params;
  const pacienteId = resolvedParams.id;

  // 2. CONSULTA OPTIMIZADA PARA TRAER RESPUESTAS DE LA FAMILIA
  const { data, error } = await supabase
    .from('pacientes')
    .select(`
      id,
      nombre,
      fecha_nacimiento,
      expediente_clinico,
      actividades_asignadas (
        id,
        estado,
        fecha_asignada,
        fecha_completada,
        feedback_terapeuta,
        quien_realizo,
        como_se_sintio,
        instrucciones_personalizadas,
        banco_actividades (
          titulo
        )
      )
    `)
    .eq('id', pacienteId)
    .single();

  const paciente = data as unknown as Paciente;

  if (error || !paciente) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl max-w-md shadow-soft border border-red-100">
          <span className="text-4xl mb-4 block">⚠️</span>
          <p className="font-bold mb-4">Error al cargar el expediente o paciente no encontrado.</p>
          <Link href="/terapeuta/panel" className="inline-block bg-white text-red-600 px-6 py-2 rounded-xl font-medium border border-red-200">
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  // 3. CÁLCULOS DE MÉTRICAS CLÍNICAS
  const actividades = paciente.actividades_asignadas || [];
  const totalAsignadas = actividades.length;
  const completadas = actividades.filter(a => a.estado === 'completada');
  const tasaCumplimiento = totalAsignadas > 0 ? Math.round((completadas.length / totalAsignadas) * 100) : 0;
  
  const actividadesOrdenadas = [...actividades].sort((a, b) => 
    new Date(b.fecha_asignada).getTime() - new Date(a.fecha_asignada).getTime()
  );
  const ultimaActividad = actividadesOrdenadas[0];

  const obtenerTituloActividad = (actividad: ActividadAsignada | undefined) => {
    if (!actividad || !actividad.banco_actividades) return "Ninguna";
    if (Array.isArray(actividad.banco_actividades)) {
      return actividad.banco_actividades[0]?.titulo || "Ninguna";
    }
    return (actividad.banco_actividades as BancoActividad).titulo || "Ninguna";
  };

  // Lógica de alerta: Sin tareas o la última no está completada
  const alertaInactividad = totalAsignadas === 0 || (ultimaActividad && ultimaActividad.estado !== 'completada');
  
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        <Link href="/terapeuta/panel" className="inline-flex items-center text-espau-blue font-semibold hover:opacity-80 transition-opacity px-2 py-2">
          &larr; Volver al directorio
        </Link>
        
        {/* Cabecera del Expediente */}
        <section className="bg-white rounded-3xl shadow-soft p-6 sm:p-8 border border-white/50 relative overflow-hidden">
          
          {/* Banner prominente de inactividad[cite: 2] */}
          {alertaInactividad && (
             <div className="mb-6 bg-red-50 text-red-700 px-5 py-4 rounded-2xl text-sm sm:text-base font-bold flex items-center gap-3 border border-red-100">
               <span className="relative flex h-3 w-3 shrink-0">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
               Alerta de Inactividad: El paciente no tiene tareas recientes completadas.
             </div>
          )}
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-espau-navy mb-6">{paciente.nombre}</h1>
          
          {/* Implementación del componente reutilizable para Notas Clínicas */}
          <div className="bg-gray-50 rounded-2xl p-1 sm:p-2 border border-gray-100">
            <EditorNotasClinicas 
              pacienteId={paciente.id}
              notasIniciales={paciente.expediente_clinico}
            />
          </div>
        </section>

        {/* Grid de Métricas Clínicas[cite: 2] */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-white/50 flex flex-col items-center justify-center text-center">
            <p className="text-xs sm:text-sm text-gray-400 font-bold mb-2 uppercase tracking-wider">Total Asignadas</p>
            <p className="text-4xl font-extrabold text-espau-navy">{totalAsignadas}</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-white/50 flex flex-col items-center justify-center text-center">
            <p className="text-xs sm:text-sm text-gray-400 font-bold mb-2 uppercase tracking-wider">Cumplimiento</p>
            <p className={`text-4xl font-extrabold ${tasaCumplimiento >= 70 ? 'text-emerald-500' : tasaCumplimiento > 0 ? 'text-amber-500' : 'text-rose-500'}`}>
              {tasaCumplimiento}%
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-soft border border-white/50 flex flex-col items-center justify-center text-center sm:col-span-2 md:col-span-1">
            <p className="text-xs sm:text-sm text-gray-400 font-bold mb-2 uppercase tracking-wider">Última Actividad</p>
            <p className="text-lg font-bold text-espau-pink truncate w-full px-2">
                {obtenerTituloActividad(ultimaActividad)}
            </p>
            <p className="text-xs font-medium text-gray-400 mt-1">
              {ultimaActividad ? new Date(ultimaActividad.fecha_asignada).toLocaleDateString() : "Sin registros"}
            </p>
          </div>
        </section>

        {/* Historial de Seguimiento con Acordeón Mobile-First */}
        <section className="bg-white rounded-3xl shadow-soft p-6 sm:p-8 border border-white/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-espau-navy">Historial de Seguimiento</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Revisa las evidencias cargadas por la familia.</p>
            </div>
            
            <Link 
              href={`/terapeuta/paciente/${paciente.id}/asignar`}
              className="w-full sm:w-auto text-center bg-espau-blue text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>+</span> Asignar Tarea
            </Link>
          </div>

          {actividadesOrdenadas.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <span className="text-4xl mb-3 block">📂</span>
              <p className="text-gray-500 font-medium">Aún no hay actividades asignadas a este paciente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {actividadesOrdenadas.map((actividad) => (
                <details key={actividad.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all shadow-sm hover:border-espau-blue/30">
                  <summary className="flex flex-col md:flex-row md:items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors list-none [&::-webkit-details-marker]:hidden outline-none focus:ring-2 focus:ring-espau-blue/20">
                    <div className="mb-4 md:mb-0">
                      <h4 className="font-bold text-lg text-espau-navy leading-tight mb-1">
                        {obtenerTituloActividad(actividad) === "Ninguna" ? "Actividad Desconocida" : obtenerTituloActividad(actividad)}
                      </h4>
                      <p className="text-sm text-gray-500 font-medium">
                        Asignada: {new Date(actividad.fecha_asignada).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        actividad.estado === 'completada' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {actividad.estado === 'completada' ? 'Completada' : 'Pendiente'}
                      </span>
                      
                      <span className="text-espau-blue text-sm font-bold group-open:hidden bg-espau-blue/5 px-3 py-1.5 rounded-lg">Ver Detalles ▼</span>
                      <span className="text-espau-pink text-sm font-bold hidden group-open:block bg-espau-pink/5 px-3 py-1.5 rounded-lg">Ocultar ▲</span>
                    </div>
                  </summary>

                  <div className="p-5 sm:p-6 border-t border-gray-100 bg-espau-bgStart/30 text-sm text-gray-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <p className="font-bold text-espau-navy mb-3 flex items-center gap-2">
                          <span>📋</span> Evidencia Recibida
                        </p>
                        <ul className="space-y-2.5 text-gray-600">
                          <li className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-50 pb-2">
                            <span className="font-semibold text-gray-800">Quién apoyó:</span> 
                            <span className="capitalize text-espau-pink font-medium">{actividad.quien_realizo || 'No registrado'}</span>
                          </li>
                          <li className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-50 pb-2">
                            <span className="font-semibold text-gray-800">Cómo se sintió:</span> 
                            <span className="capitalize">{actividad.como_se_sintio || 'No registrado'}</span>
                          </li>
                          {actividad.fecha_completada && (
                            <li className="flex flex-col sm:flex-row sm:justify-between pt-1">
                              <span className="font-semibold text-gray-800">Fecha de entrega:</span> 
                              <span>{new Date(actividad.fecha_completada).toLocaleDateString()}</span>
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <p className="font-bold text-espau-navy mb-3 flex items-center gap-2">
                          <span>💡</span> Instrucciones Asignadas
                        </p>
                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {actividad.instrucciones_personalizadas || 'Se enviaron las instrucciones estándar del banco de actividades.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}