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
    <main className="min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Cabecera Responsiva y Consistente */}
        <header className="bg-white rounded-3xl shadow-soft p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-white/50">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-espau-navy tracking-tight">
              Banco de Actividades
            </h1>
            <p className="text-gray-500 text-sm mt-1.5 font-medium">
              Explora, busca y gestiona el catálogo de ejercicios terapéuticos.
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <Link 
              href="/terapeuta/panel" 
              className="flex items-center justify-center w-full sm:w-auto text-center bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-espau-pink px-6 py-3.5 rounded-xl font-semibold transition-all border border-gray-200 active:scale-[0.98]"
            >
              <span className="mr-2">&larr;</span> Volver al Panel
            </Link>
          </div>
        </header>

        {/* Contenedor del Buscador y Grid de Actividades */}
        <section className="bg-white rounded-3xl shadow-soft p-4 sm:p-8 border border-white/50">
          {/* 
            Inyectamos el componente cliente pasándole los datos enriquecidos.
            Aquí vivirá la lógica de los filtros y etiquetas.
          */}
          <BuscadorBanco actividadesIniciales={actividades || []} />
        </section>

      </div>
    </main>
  );
}