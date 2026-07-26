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

  // 2. ACTUALIZAMOS LA CONSULTA PARA TRAER LAS RESPUESTAS DE LA FAMILIA
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
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">Error al cargar el expediente o paciente no encontrado.</p>
        <Link href="/terapeuta/panel" className="text-blue-600 hover:underline">Volver al panel</Link>
      </div>
    );
  }

  // 3. CÁLCULOS DE MÉTRICAS
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

  const alertaInactividad = totalAsignadas === 0 || (ultimaActividad && ultimaActividad.estado !== 'completada');
  
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/terapeuta/panel" className="text-blue-600 hover:underline mb-6 inline-block font-medium">
          &larr; Volver al directorio
        </Link>
        
        {/* Cabecera del Expediente */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100 mb-6 relative overflow-hidden">
          {alertaInactividad && (
             <div className="absolute top-0 right-0 bg-red-100 text-red-700 px-4 py-1 rounded-bl-lg text-sm font-bold flex items-center gap-2">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
               </span>
               Alerta de Inactividad
             </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{paciente.nombre}</h1>
          
          {/* Implementación del componente reutilizable para Notas Clínicas */}
          <EditorNotasClinicas 
            pacienteId={paciente.id}
            notasIniciales={paciente.expediente_clinico}
          />
        </div>

        {/* Grid de Métricas Clínicas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1 font-medium">Total Asignadas</p>
            <p className="text-3xl font-bold text-gray-800">{totalAsignadas}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1 font-medium">Tasa de Cumplimiento</p>
            <p className={`text-3xl font-bold ${tasaCumplimiento >= 70 ? 'text-green-600' : tasaCumplimiento > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
              {tasaCumplimiento}%
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1 font-medium">Última Actividad</p>
            <p className="text-lg font-bold text-gray-800 truncate">
                {obtenerTituloActividad(ultimaActividad)}
            </p>
            <p className="text-sm text-gray-400">
              {ultimaActividad ? new Date(ultimaActividad.fecha_asignada).toLocaleDateString() : "-"}
            </p>
          </div>
        </div>

        {/* Historial de Actividades con Acordeón (Detalles) */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Historial de Seguimiento</h2>
            <Link 
              href={`/terapeuta/paciente/${paciente.id}/asignar`}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              + Asignar Nueva Tarea
            </Link>
          </div>

          {actividadesOrdenadas.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-500">Aún no hay actividades asignadas a este paciente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {actividadesOrdenadas.map((actividad) => (
                <details key={actividad.id} className="group border rounded-lg overflow-hidden transition-all bg-white">
                  <summary className="flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer hover:bg-gray-50 list-none [&::-webkit-details-marker]:hidden">
                    <div className="mb-2 md:mb-0">
                      <h4 className="font-semibold text-gray-800">
                        {obtenerTituloActividad(actividad) === "Ninguna" ? "Actividad Desconocida" : obtenerTituloActividad(actividad)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Asignada: {new Date(actividad.fecha_asignada).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        actividad.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {actividad.estado === 'completada' ? 'Completada' : 'Pendiente'}
                      </span>
                      
                      <span className="text-blue-600 text-sm font-medium group-open:hidden">Ver Detalles ▼</span>
                      <span className="text-blue-600 text-sm font-medium hidden group-open:block">Ocultar ▲</span>
                    </div>
                  </summary>

                  <div className="p-4 border-t border-gray-100 bg-blue-50/30 text-sm text-gray-700 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-bold text-gray-800 mb-1">📋 Evidencia Recibida</p>
                        <ul className="space-y-1 ml-1 text-gray-600">
                          <li><span className="font-medium text-gray-700">Quién apoyó:</span> {actividad.quien_realizo || 'No registrado'}</li>
                          <li><span className="font-medium text-gray-700">Cómo se sintió:</span> {actividad.como_se_sintio || 'No registrado'}</li>
                          {actividad.fecha_completada && (
                            <li><span className="font-medium text-gray-700">Fecha de entrega:</span> {new Date(actividad.fecha_completada).toLocaleDateString()}</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 mb-1">💡 Instrucciones Asignadas</p>
                        <p className="text-gray-600 italic">
                          {actividad.instrucciones_personalizadas || 'Se enviaron las instrucciones por defecto.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}