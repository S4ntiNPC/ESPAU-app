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

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-gray-500 font-medium">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-espau-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Cargando detalles de la actividad...</p>
        </div>
      </div>
    );
  }

  // Clases utilitarias compartidas para inputs
  const inputClasses = "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-base placeholder:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed";
  const labelClasses = "block text-sm font-bold text-espau-navy mb-1.5 ml-1";

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        
        <Link 
          href="/terapeuta/banco-actividades" 
          className="inline-flex items-center text-espau-blue font-semibold hover:opacity-80 transition-opacity px-2 py-2"
        >
          &larr; Volver al Banco
        </Link>

        <section className="bg-white rounded-3xl shadow-soft border border-white/50 overflow-hidden">
          
          {/* Cabecera Limpia */}
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-espau-bgStart/30">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-espau-navy tracking-tight mb-2">
              Editar Actividad
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-medium">
              Modifica los detalles de este recurso para toda la clínica.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 sm:space-y-8">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Datos Principales */}
            <div className="space-y-5">
              <div>
                <label className={labelClasses}>Título <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)} 
                  className={inputClasses} 
                  disabled={guardando} 
                  placeholder="Ej. Ejercicio de seguimiento visual"
                />
              </div>

              <div>
                <label className={labelClasses}>Explicación <span className="text-red-500">*</span></label>
                <textarea 
                  value={explicacion} 
                  onChange={(e) => setExplicacion(e.target.value)} 
                  className={`${inputClasses} min-h-[120px] resize-y`} 
                  disabled={guardando} 
                  placeholder="Describe paso a paso cómo realizar la actividad..."
                />
              </div>
            </div>

            {/* Pregunta de Validación */}
            <div className="bg-emerald-50/50 p-5 sm:p-6 rounded-2xl border border-emerald-100">
              <label className="block text-sm font-bold text-emerald-900 mb-1.5 ml-1 flex items-center gap-2">
                <span>❓</span> Pregunta de validación (Opcional)
              </label>
              <p className="text-xs text-emerald-700/80 mb-3 ml-1">
                Aparecerá en el formulario de salida para confirmar la comprensión del ejercicio.
              </p>
              <input 
                type="text" 
                value={preguntaValidacion} 
                onChange={(e) => setPreguntaValidacion(e.target.value)} 
                className="w-full px-4 py-3.5 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-base placeholder:text-gray-400 disabled:opacity-60" 
                disabled={guardando} 
                placeholder="Ej. ¿Cuántas repeticiones logró el menor?"
              />
            </div>

            {/* Extras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100">
              <div>
                <label className={`${labelClasses} flex items-center gap-2`}>
                  <span>💡</span> Tips Extra
                </label>
                <textarea 
                  value={tipsExtra} 
                  onChange={(e) => setTipsExtra(e.target.value)} 
                  className={`${inputClasses} min-h-[100px] resize-y`} 
                  disabled={guardando} 
                  placeholder="Recomendaciones adicionales..."
                />
              </div>
              
              <div>
                <label className={`${labelClasses} flex items-center gap-2`}>
                  <span>🖼️</span> URL Apoyo visual
                </label>
                <input 
                  type="url" 
                  value={apoyoVisualUrl} 
                  onChange={(e) => setApoyoVisualUrl(e.target.value)} 
                  className={inputClasses} 
                  disabled={guardando} 
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            {/* Controles de Acción */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => router.push('/terapeuta/banco-actividades')} 
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold transition-colors active:scale-[0.98]" 
                disabled={guardando}
              >
                Cancelar
              </button>
              
              <button 
                type="submit" 
                disabled={guardando} 
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-espau-blue text-white hover:bg-opacity-90 font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {guardando ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
            
          </form>
        </section>
      </div>
    </main>
  );
}