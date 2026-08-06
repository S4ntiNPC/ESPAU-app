'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearActividadBanco } from '../../actions/accionesBanco';

export default function CrearActividadPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await crearActividadBanco(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      router.push('/admin/banco-actividades');
      router.refresh();
    }
  };

  const inputClasses = "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm";
  const labelClasses = "block text-sm font-bold text-slate-700 mb-1.5 ml-1";

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto font-sans">
      <div className="mb-6">
        <Link 
          href="/admin/banco-actividades" 
          className="inline-flex items-center text-blue-600 font-semibold hover:opacity-80 transition-opacity mb-4"
        >
          &larr; Volver al Banco de Actividades
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Nueva Actividad</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Agrega un nuevo ejercicio al repositorio global para que los terapeutas puedan asignarlo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="titulo" className={labelClasses}>Título de la Actividad *</label>
            <input 
              type="text" 
              id="titulo"
              name="titulo" 
              required
              placeholder="Ej: Identificación de emociones básicas"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="explicacion" className={labelClasses}>Explicación / Instrucciones *</label>
            <textarea 
              id="explicacion"
              name="explicacion" 
              required
              rows={4}
              placeholder="Describe paso a paso cómo debe realizarse el ejercicio en casa..."
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="tips_extra" className={labelClasses}>Tips Extra (Opcional)</label>
            <textarea 
              id="tips_extra"
              name="tips_extra" 
              rows={2}
              placeholder="Ej: Si el niño se frustra, hagan una pausa de 5 minutos."
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="pregunta_validacion" className={labelClasses}>Pregunta de Validación para la Familia *</label>
            <p className="text-xs text-gray-500 mb-2 ml-1">
              Esta pregunta aparecerá en la encuesta de salida cuando la familia termine la actividad[cite: 2].
            </p>
            <input 
              type="text" 
              id="pregunta_validacion"
              name="pregunta_validacion" 
              required
              placeholder="Ej: ¿Logró identificar la tarjeta feliz al primer intento?"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="apoyos_visuales_url" className={labelClasses}>URL de Apoyo Visual (Opcional)</label>
            <input 
              type="url" 
              id="apoyos_visuales_url"
              name="apoyos_visuales_url" 
              placeholder="https://ejemplo.com/imagen-apoyo.jpg"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
          >
            {isSubmitting ? 'Guardando actividad...' : 'Crear Actividad'}
          </button>
        </div>
      </form>
    </div>
  );
}