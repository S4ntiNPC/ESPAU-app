import Link from 'next/link';
import { createClient } from '../../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import EditorNotasClinicas from '../../../../components/EditorNotasClinicas';
import Image from 'next/image';

// 1. INTERFACES CORREGIDAS SEGÚN EL ESQUEMA SQL
interface BancoActividad {
  titulo: string;
  pregunta_validacion: string | null; // Corregido: Proviene del banco
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
  respuesta_validacion: string | null; // Corregido: Coincide con SQL
  evidencia_url: string | null;
  banco_actividades: BancoActividad | BancoActividad[] | null; 
}

interface Paciente {
  id: string;
  nombre: string;
  fecha_nacimiento: string;
  expediente_clinico: string | null;
  actividades_asignadas: ActividadAsignada[];
}

// Helper para suplir la falta de 'evidencia_tipo' en el MVP
const esVideoUrl = (url: string | null) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
};

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

  // 2. CONSULTA SQL CORREGIDA
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
        respuesta_validacion, 
        evidencia_url,
        banco_actividades (
          titulo,
          pregunta_validacion 
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

  // 3. CÁLCULOS Y HELPERS
  const actividades = paciente.actividades_asignadas || [];
  const totalAsignadas = actividades.length;
  const completadas = actividades.filter(a => a.estado === 'completada');
  const tasaCumplimiento = totalAsignadas > 0 ? Math.round((completadas.length / totalAsignadas) * 100) : 0;
  
  const actividadesOrdenadas = [...actividades].sort((a, b) => 
    new Date(b.fecha_asignada).getTime() - new Date(a.fecha_asignada).getTime()
  );
  const ultimaActividad = actividadesOrdenadas[0];

  const obtenerDatosBanco = (actividad: ActividadAsignada | undefined) => {
    if (!actividad || !actividad.banco_actividades) return { titulo: "Ninguna", pregunta: null };
    const banco = Array.isArray(actividad.banco_actividades) 
      ? actividad.banco_actividades[0] 
      : actividad.banco_actividades;
    return { 
      titulo: banco?.titulo || "Ninguna", 
      pregunta: banco?.pregunta_validacion 
    };
  };

  const alertaInactividad = totalAsignadas === 0 || (ultimaActividad && ultimaActividad.estado !== 'completada');
  
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        <Link href="/terapeuta/panel" className="inline-flex items-center text-blue-600 font-semibold hover:opacity-80 transition-opacity px-2 py-2">
          &larr; Volver al directorio
        </Link>
        
        <section className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-slate-100 relative overflow-hidden">
          {alertaInactividad && (
             <div className="mb-6 bg-red-50 text-red-700 px-5 py-4 rounded-2xl text-sm sm:text-base font-bold flex items-center gap-3 border border-red-100">
               <span className="relative flex h-3 w-3 shrink-0">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
               Alerta de Inactividad: El paciente no tiene tareas recientes completadas.
             </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6">{paciente.nombre}</h1>
          <div className="bg-gray-50 rounded-2xl p-1 sm:p-2 border border-gray-100">
            <EditorNotasClinicas 
              pacienteId={paciente.id}
              notasIniciales={paciente.expediente_clinico}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <p className="text-xs sm:text-sm text-gray-400 font-bold mb-2 uppercase tracking-wider">Total Asignadas</p>
            <p className="text-4xl font-extrabold text-slate-800">{totalAsignadas}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <p className="text-xs sm:text-sm text-gray-400 font-bold mb-2 uppercase tracking-wider">Cumplimiento</p>
            <p className={`text-4xl font-extrabold ${tasaCumplimiento >= 70 ? 'text-emerald-500' : tasaCumplimiento > 0 ? 'text-amber-500' : 'text-rose-500'}`}>
              {tasaCumplimiento}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center sm:col-span-2 md:col-span-1">
            <p className="text-xs sm:text-sm text-gray-400 font-bold mb-2 uppercase tracking-wider">Última Actividad</p>
            <p className="text-lg font-bold text-blue-600 truncate w-full px-2">
                {obtenerDatosBanco(ultimaActividad).titulo}
            </p>
            <p className="text-xs font-medium text-gray-400 mt-1">
              {ultimaActividad ? new Date(ultimaActividad.fecha_asignada).toLocaleDateString() : "Sin registros"}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Historial de Seguimiento</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Revisa las evidencias cargadas por la familia.</p>
            </div>
            <Link 
              href={`/terapeuta/paciente/${paciente.id}/asignar`}
              className="w-full sm:w-auto text-center bg-blue-600 text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
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
              {actividadesOrdenadas.map((actividad) => {
                const { titulo, pregunta } = obtenerDatosBanco(actividad);
                
                return (
                  <details key={actividad.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all shadow-sm hover:border-blue-200">
                    <summary className="flex flex-col md:flex-row md:items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors list-none outline-none focus:ring-2 focus:ring-blue-100 [&::-webkit-details-marker]:hidden">
                      <div className="mb-4 md:mb-0">
                        <h4 className="font-bold text-lg text-slate-800 leading-tight mb-1">
                          {titulo}
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
                        <span className="text-blue-600 text-sm font-bold group-open:hidden bg-blue-50 px-3 py-1.5 rounded-lg">Ver Detalles ▼</span>
                        <span className="text-slate-500 text-sm font-bold hidden group-open:block bg-slate-100 px-3 py-1.5 rounded-lg">Ocultar ▲</span>
                      </div>
                    </summary>

                    <div className="p-5 sm:p-6 border-t border-gray-100 bg-slate-50/50 text-sm text-gray-700">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-slate-800 mb-3 flex items-center gap-2"><span>📋</span> Datos de Salida</p>
                            <ul className="space-y-2.5 text-gray-600">
                              <li className="flex flex-col border-b border-gray-50 pb-2">
                                <span className="font-semibold text-gray-800 text-xs uppercase tracking-wider">Quién apoyó</span> 
                                <span className="capitalize text-blue-600 font-medium mt-1">{actividad.quien_realizo || 'No registrado'}</span>
                              </li>
                              <li className="flex flex-col border-b border-gray-50 pb-2">
                                <span className="font-semibold text-gray-800 text-xs uppercase tracking-wider">Cómo se sintió</span> 
                                <span className="capitalize mt-1">{actividad.como_se_sintio || 'No registrado'}</span>
                              </li>
                            </ul>
                          </div>
                          {actividad.fecha_completada && (
                            <div className="pt-4 mt-auto">
                              <span className="font-semibold text-gray-800 block text-xs uppercase tracking-wider">Fecha de entrega:</span> 
                              <span className="text-gray-500">{new Date(actividad.fecha_completada).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                          <p className="font-bold text-slate-800 mb-3 flex items-center gap-2"><span>💡</span> Validación del Ejercicio</p>
                          <div className="space-y-4">
                            <div>
                              <span className="font-semibold text-gray-800 text-xs uppercase tracking-wider block mb-1">Pregunta Asignada</span>
                              <p className="text-gray-600 leading-relaxed bg-gray-50 p-2 rounded-lg border border-gray-100 text-sm">
                                {pregunta || 'No se asignó pregunta de validación.'}
                              </p>
                            </div>
                            <div>
                              <span className="font-semibold text-blue-600 text-xs uppercase tracking-wider block mb-1">Respuesta de Familia</span>
                              <p className="text-gray-700 font-medium bg-blue-50/50 p-2 rounded-lg border border-blue-100 text-sm">
                                {actividad.respuesta_validacion || 'Sin respuesta.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                          <p className="font-bold text-slate-800 mb-3 flex items-center gap-2"><span>📸</span> Evidencia Adjunta</p>
                          <div className="flex-1 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center relative overflow-hidden min-h-[160px]">
                            {actividad.evidencia_url ? (
                              esVideoUrl(actividad.evidencia_url) ? (
                                <video src={actividad.evidencia_url} controls className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <Image 
                                  src={actividad.evidencia_url} 
                                  alt="Evidencia enviada por la familia" 
                                  fill
                                  className="object-cover hover:object-contain transition-all"
                                />
                              )
                            ) : (
                              <div className="text-center p-4">
                                <span className="text-2xl opacity-50 block mb-2">🚫</span>
                                <span className="text-gray-400 text-sm font-medium">Sin evidencia adjunta</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}