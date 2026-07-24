'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/client';

interface Actividad {
  id: string;
  titulo: string;
  explicacion: string;
}

interface Props {
  pacienteId: string;
  actividades: Actividad[];
}

export default function FormularioAsignacion({ pacienteId, actividades }: Props) {
  const router = useRouter();
  const supabase = createClient();
  
  const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null);
  const [instrucciones, setInstrucciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const handleAsignar = async () => {
    if (!actividadSeleccionada) {
      setError('Por favor, selecciona una actividad del banco.');
      return;
    }

    setGuardando(true);
    setError('');

    const { error: insertError } = await supabase
      .from('actividades_asignadas')
      .insert({
        paciente_id: pacienteId,
        actividad_id: actividadSeleccionada.id,
        estado: 'pendiente',
        instrucciones_personalizadas: instrucciones || null,
      });

    if (insertError) {
      console.error(insertError);
      setError('Hubo un error al asignar la tarea. Intenta de nuevo.');
      setGuardando(false);
    } else {
      // Forzamos a Next.js a limpiar el caché y redirigimos al expediente
      router.refresh();
      router.push(`/terapeuta/paciente/${pacienteId}`);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium">
          {error}
        </div>
      )}

      {/* Paso 1: Seleccionar Actividad */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">1. Selecciona una actividad del banco</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-1">
          {actividades.map((act) => (
            <div 
              key={act.id}
              onClick={() => setActividadSeleccionada(act)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                actividadSeleccionada?.id === act.id 
                  ? 'border-purple-600 bg-purple-50 shadow-md' 
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 bg-white'
              }`}
            >
              <h3 className={`font-bold ${actividadSeleccionada?.id === act.id ? 'text-purple-800' : 'text-gray-800'}`}>
                {act.titulo}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{act.explicacion}</p>
            </div>
          ))}
          {actividades.length === 0 && (
            <p className="text-gray-500 col-span-full">No hay actividades registradas en el banco aún.</p>
          )}
        </div>
      </div>

      {/* Paso 2: Personalizar (Opcional) */}
      {actividadSeleccionada && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">2. Personaliza las instrucciones (Opcional)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Agrega notas específicas para que la familia sepa cómo adaptar <b>{actividadSeleccionada.titulo}</b> a lo trabajado en sesión.
          </p>
          
          <textarea
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value)}
            placeholder="Ej. Juanito logró hacer el ejercicio con la pelota azul hoy. En casa, intenten hacerlo 3 veces usando su juguete favorito..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-4"
          />

          <div className="flex justify-end gap-3">
            <button 
              onClick={() => router.push(`/terapeuta/paciente/${pacienteId}`)}
              className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button 
              onClick={handleAsignar}
              disabled={guardando}
              className="px-6 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {guardando ? 'Asignando...' : 'Asignar Tarea'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}