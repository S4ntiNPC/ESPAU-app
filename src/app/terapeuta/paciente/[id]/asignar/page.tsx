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
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href={`/terapeuta/paciente/${paciente.id}`} className="text-blue-600 hover:underline mb-6 inline-block font-medium">
          &larr; Volver al expediente
        </Link>
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Asignar Nueva Actividad</h1>
          <p className="text-gray-500">Paciente: <span className="font-semibold text-gray-700">{paciente.nombre}</span></p>
        </div>
        
        {/* Aquí renderizamos el Client Component que maneja la lógica */}
        <FormularioAsignacion 
          pacienteId={paciente.id} 
          actividades={actividades || []} 
        />
        
      </div>
    </main>
  );
}