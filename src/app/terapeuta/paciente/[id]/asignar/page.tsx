import Link from 'next/link';
import { createClient } from '../../../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import FormularioAsignacion from './FormularioAsignacion';

export default async function AsignarTareaPaciente({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const supabase = await createClient();
  
  // 1. Verificamos sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const resolvedParams = await params;
  const pacienteId = resolvedParams.id;

  // 2. Obtenemos datos básicos del paciente para la cabecera
  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre')
    .eq('id', pacienteId)
    .single();

  if (!paciente) {
    redirect('/terapeuta/panel');
  }

  // 3. Obtenemos todo el catálogo del Banco de Actividades
  const { data: actividades } = await supabase
    .from('banco_actividades')
    .select('id, titulo, explicacion')
    .order('creado_en', { ascending: false });

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        <Link 
          href={`/terapeuta/paciente/${paciente.id}`} 
          className="inline-flex items-center text-espau-blue font-semibold hover:opacity-80 transition-opacity px-2 py-2"
        >
          &larr; Volver al expediente
        </Link>
        
        <section className="bg-white rounded-3xl shadow-soft p-6 sm:p-8 border border-white/50">
          
          {/* Cabecera de Contexto */}
          <div className="mb-8 border-b border-gray-100 pb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-espau-navy tracking-tight mb-2">
              Asignar Nueva Actividad
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-medium flex flex-wrap items-center gap-2">
              Paciente: <span className="font-bold text-espau-pink bg-espau-pink/10 px-3 py-1 rounded-lg">{paciente.nombre}</span>
            </p>
            <p className="text-sm text-gray-400 mt-4 leading-relaxed">
              Selecciona un ejercicio del banco y personaliza las instrucciones para asegurar que la familia refuerce correctamente lo trabajado hoy.
            </p>
          </div>
          
          {/* 
            Contenedor del Formulario Cliente 
            Aquí se resolverá el requerimiento de hacer la asignación editable[cite: 2]
          */}
          <div className="bg-espau-bgStart/30 rounded-2xl p-1 sm:p-6 border border-espau-blue/10">
            <FormularioAsignacion 
              pacienteId={paciente.id} 
              actividades={actividades || []} 
            />
          </div>
          
        </section>
      </div>
    </main>
  );
}