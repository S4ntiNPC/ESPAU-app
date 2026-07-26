import { createClient } from '../../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import GraficasMetricas from './GraficasMetricas';

// 1. Interfaz para las actividades
interface Actividad {
  estado: string;
  quien_realizo: string | null;
}

// 2. Interfaz FINAL (Sin el campo 'apellidos' a nivel paciente)
interface PacienteMetricas {
  id: string;
  nombre: string;
  terapeuta: { nombre: string; apellidos: string } | null;
  actividades_asignadas: Actividad[];
}

// 3. Interfaz CRUDA (Lo que devuelve Supabase realmente)
interface PacienteRaw {
  id: string;
  nombre: string;
  terapeuta: { nombre: string; apellidos: string } | null;
  actividades_asignadas: Actividad[];
}

export default async function MetricasDetalladasPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // EL FIX: Quitamos 'apellidos' de la raíz, porque la tabla 'pacientes' no lo tiene.
  // Solo lo mantenemos dentro del 'terapeuta' (que viene de la tabla perfiles).
  const { data, error } = await supabase
    .from('pacientes')
    .select(`
      id,
      nombre,
      terapeuta:perfiles!pacientes_terapeuta_id_fkey(nombre, apellidos),
      actividades_asignadas(estado, quien_realizo)
    `)
    .order('nombre');

  if (error) {
    // Imprimimos el error real en la terminal del servidor (VS Code) para futuros debugs
    console.error("Error de Supabase al cargar métricas:", error.message);
    return <div className="p-8 text-red-500 font-medium">Error al cargar los datos de métricas. Revisa la consola del servidor.</div>;
  }

  const rawData = data as unknown as PacienteRaw[];

  // Formateo seguro
  const pacientesFormateados: PacienteMetricas[] = (rawData || []).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    terapeuta: p.terapeuta,
    actividades_asignadas: p.actividades_asignadas || []
  }));

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard" className="text-blue-600 hover:underline font-medium text-sm mb-2 inline-block">
              &larr; Volver al Panel de Administración
            </Link>
            <h1 className="text-3xl font-bold text-slate-800">Reporte Detallado de Seguimiento</h1>
            <p className="text-slate-500 mt-1">Analiza el rendimiento global o filtra por paciente específico.</p>
          </div>
        </div>

        <GraficasMetricas pacientes={pacientesFormateados} />
      </div>
    </main>
  );
}