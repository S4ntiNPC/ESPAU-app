'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../../utils/supabase/client';

export default function CrearActividadPage() {
  const router = useRouter();
  const supabase = createClient();

  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [explicacion, setExplicacion] = useState('');
  const [tipsExtra, setTipsExtra] = useState('');
  const [apoyoVisualUrl, setApoyoVisualUrl] = useState('');
  const [preguntaValidacion, setPreguntaValidacion] = useState(''); // NUEVO ESTADO
  
  // Estados de la interfaz
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación básica del MVP
    if (!titulo.trim() || !explicacion.trim()) {
      setError('El título y la explicación son campos obligatorios.');
      return;
    }

    setGuardando(true);

    try {
      // 1. Obtenemos el ID del terapeuta logueado para registrar quién lo creó
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No hay una sesión activa.');
      }

      // 2. Insertamos la nueva actividad en la base de datos
      const { error: insertError } = await supabase
        .from('banco_actividades')
        .insert({
          titulo: titulo.trim(),
          explicacion: explicacion.trim(),
          tips_extra: tipsExtra.trim() || null,
          apoyos_visuales_url: apoyoVisualUrl.trim() || null,
          pregunta_validacion: preguntaValidacion.trim() || null, // NUEVO CAMPO
          creado_por: user.id
        });

      if (insertError) throw new Error(insertError.message);

      // 3. Limpiamos caché y redirigimos al catálogo
      router.refresh();
      router.push('/terapeuta/banco-actividades');
      
    } catch (err) {
      console.error('Error al crear actividad:', err);
      
      // Manejo seguro del error estricto
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Hubo un error al guardar la actividad. Intenta nuevamente.');
      }
      
      setGuardando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Navegación */}
        <Link href="/terapeuta/banco-actividades" className="text-blue-600 hover:underline mb-6 inline-block font-medium">
          &larr; Volver al Banco de Actividades
        </Link>

        {/* Contenedor Principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-purple-600 p-6 md:p-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Crear Nueva Actividad</h1>
            <p className="text-purple-100 text-sm">
              Añade un nuevo ejercicio terapéutico al catálogo. Estará disponible para que otros terapeutas también puedan asignarlo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium text-sm border border-red-100">
                {error}
              </div>
            )}

            {/* Campo: Título */}
            <div>
              <label htmlFor="titulo" className="block text-sm font-bold text-gray-700 mb-1">
                Título de la actividad *
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Ejercicio de pinza fina con pinzas de ropa"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow"
                disabled={guardando}
              />
            </div>

            {/* Campo: Explicación */}
            <div>
              <label htmlFor="explicacion" className="block text-sm font-bold text-gray-700 mb-1">
                Explicación paso a paso *
              </label>
              <p className="text-xs text-gray-500 mb-2">Describe la actividad de forma clara y sin tecnicismos médicos para que la familia la entienda fácilmente.</p>
              <textarea
                id="explicacion"
                value={explicacion}
                onChange={(e) => setExplicacion(e.target.value)}
                placeholder="1. Colocar 5 pinzas en la mesa...&#10;2. Pedirle al niño que..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-shadow"
                disabled={guardando}
              />
            </div>

            {/* NUEVO CAMPO: Pregunta de validación */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <label htmlFor="preguntaValidacion" className="block text-sm font-bold text-purple-900 mb-1">
                Pregunta de validación del ejercicio (Opcional)
              </label>
              <p className="text-xs text-purple-700 mb-3">
                Escribe una pregunta sencilla para comprobar que la familia realizó la actividad. Ej: &quot;¿De qué color era el bloque que más le costó clasificar?&quot;
              </p>
              <input
                id="preguntaValidacion"
                type="text"
                value={preguntaValidacion}
                onChange={(e) => setPreguntaValidacion(e.target.value)}
                placeholder="Ej. ¿Logró sostener la pinza por más de 5 segundos?"
                className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow"
                disabled={guardando}
              />
            </div>

            <hr className="border-gray-100 my-6" />

            {/* Tips y Apoyos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tipsExtra" className="block text-sm font-bold text-gray-700 mb-1">
                  Tips Extra (Opcional)
                </label>
                <textarea
                  id="tipsExtra"
                  value={tipsExtra}
                  onChange={(e) => setTipsExtra(e.target.value)}
                  placeholder="Ej. Si se frustra, intenten contar..."
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-shadow"
                  disabled={guardando}
                />
              </div>
              <div>
                <label htmlFor="apoyoVisualUrl" className="block text-sm font-bold text-gray-700 mb-1">
                  Enlace a apoyo visual (URL)
                </label>
                <input
                  id="apoyoVisualUrl"
                  type="url"
                  value={apoyoVisualUrl}
                  onChange={(e) => setApoyoVisualUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow"
                  disabled={guardando}
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/terapeuta/banco-actividades')}
                className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors w-full md:w-auto"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-6 py-3 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto shadow-sm"
              >
                {guardando ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Guardando...
                  </>
                ) : (
                  'Crear Actividad'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}