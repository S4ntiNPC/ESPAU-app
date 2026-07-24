'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../../../utils/supabase/client';

export default function EditarActividadPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  
  // Desempaquetamos los params usando el hook `use` (Next.js 15+)
  const resolvedParams = use(params);
  const actividadId = resolvedParams.id;

  const [titulo, setTitulo] = useState('');
  const [explicacion, setExplicacion] = useState('');
  const [tipsExtra, setTipsExtra] = useState('');
  const [apoyoVisualUrl, setApoyoVisualUrl] = useState('');
  const [preguntaValidacion, setPreguntaValidacion] = useState('');
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    const cargarActividad = async () => {
      const { data, error } = await supabase
        .from('banco_actividades')
        .select('*')
        .eq('id', actividadId)
        .single();

      if (error) {
        setError('Error al cargar la actividad.');
      } else if (data) {
        setTitulo(data.titulo || '');
        setExplicacion(data.explicacion || '');
        setTipsExtra(data.tips_extra || '');
        setApoyoVisualUrl(data.apoyos_visuales_url || '');
        setPreguntaValidacion(data.pregunta_validacion || '');
      }
      setCargando(false);
    };
    cargarActividad();
  }, [actividadId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim() || !explicacion.trim()) {
      setError('El título y la explicación son obligatorios.');
      return;
    }

    setGuardando(true);
    try {
      const { error: updateError } = await supabase
        .from('banco_actividades')
        .update({
          titulo: titulo.trim(),
          explicacion: explicacion.trim(),
          tips_extra: tipsExtra.trim() || null,
          apoyos_visuales_url: apoyoVisualUrl.trim() || null,
          pregunta_validacion: preguntaValidacion.trim() || null
        })
        .eq('id', actividadId);

      if (updateError) throw new Error(updateError.message);

      router.refresh();
      router.push('/terapeuta/banco-actividades');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar.');
      setGuardando(false);
    }
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center p-8 text-gray-500">Cargando detalles de la actividad...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/terapeuta/banco-actividades" className="text-blue-600 hover:underline mb-6 inline-block font-medium">
          &larr; Volver al Banco
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 p-6 md:p-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Editar Actividad</h1>
            <p className="text-blue-100 text-sm">Modifica los detalles de este recurso para toda la clínica.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">{error}</div>}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Título *</label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" disabled={guardando} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Explicación *</label>
              <textarea value={explicacion} onChange={(e) => setExplicacion(e.target.value)} className="w-full h-32 p-3 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500" disabled={guardando} />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="block text-sm font-bold text-blue-900 mb-1">Pregunta de validación</label>
              <input type="text" value={preguntaValidacion} onChange={(e) => setPreguntaValidacion(e.target.value)} className="w-full p-3 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" disabled={guardando} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tips Extra</label>
                <textarea value={tipsExtra} onChange={(e) => setTipsExtra(e.target.value)} className="w-full h-20 p-3 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500" disabled={guardando} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">URL Apoyo visual</label>
                <input type="url" value={apoyoVisualUrl} onChange={(e) => setApoyoVisualUrl(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" disabled={guardando} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => router.push('/terapeuta/banco-actividades')} className="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 font-medium" disabled={guardando}>Cancelar</button>
              <button type="submit" disabled={guardando} className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2">
                {guardando ? 'Actualizando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}