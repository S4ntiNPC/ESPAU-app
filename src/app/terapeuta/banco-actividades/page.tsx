import Link from 'next/link';
import { createClient } from '../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import BuscadorBanco from './BuscadorBanco';

export default async function BancoActividadesPage() {
  const supabase = await createClient();
  
  // 1. Verificamos la sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Obtenemos todas las actividades y cruzamos con 'perfiles' para obtener el autor
  const { data: actividades, error } = await supabase
    .from('banco_actividades')
    .select(`
      id, 
      titulo, 
      explicacion, 
      tips_extra, 
      apoyos_visuales_url, 
      pregunta_validacion, 
      creado_en,
      perfiles:creado_por ( nombre, apellidos )
    `)
    .order('creado_en', { ascending: false });

  if (error) {
    console.error("Error cargando banco de actividades:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera */}
        <div className="mb-8">
          <Link href="/terapeuta/panel" className="text-blue-600 hover:underline mb-4 inline-block font-medium">
            &larr; Volver al Panel
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Banco de Actividades</h1>
          <p className="text-gray-500 mt-1">Explora, busca y gestiona el catálogo de ejercicios terapéuticos.</p>
        </div>

        {/* Inyectamos el componente cliente pasándole los datos enriquecidos */}
        <BuscadorBanco actividadesIniciales={actividades || []} />

      </div>
    </main>
  );
}