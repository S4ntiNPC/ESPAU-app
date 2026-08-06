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
      router.refresh();
      router.push(`/terapeuta/paciente/${pacienteId}`);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold text-sm border border-red-100 flex items-center gap-2 shadow-sm">
          <span className="text-lg">⚠️</span> {error}
        </div>
      )}

      {/* Paso 1: Seleccionar Actividad con Grid Interactivo */}
      <section>
        <h2 className="text-lg sm:text-xl font-extrabold text-espau-navy mb-4 flex items-center gap-2">
          <span className="bg-espau-navy text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span> 
          Selecciona una actividad del banco
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1 pr-2 pb-4">
          {actividades.map((act) => {
            const isSelected = actividadSeleccionada?.id === act.id;
            
            return (
              <div 
                key={act.id}
                onClick={() => setActividadSeleccionada(act)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group flex flex-col h-full ${
                  isSelected 
                    ? 'border-espau-blue bg-espau-bgStart shadow-md scale-[0.99]' 
                    : 'border-gray-100 hover:border-espau-blue/40 hover:bg-gray-50 bg-white hover:shadow-soft'
                }`}
              >
                {/* SOLUCIÓN: Usamos flexbox para separar el título del check sin superposición */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className={`font-bold text-base line-clamp-2 ${isSelected ? 'text-espau-blue' : 'text-espau-navy'}`}>
                    {act.titulo}
                  </h3>
                  
                  {isSelected && (
                    <div className="shrink-0 bg-espau-blue text-white rounded-full p-1 animate-in zoom-in">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <p className={`text-sm mt-auto line-clamp-3 ${isSelected ? 'text-espau-blue/80' : 'text-gray-500'}`}>
                  {act.explicacion}
                </p>
              </div>
            )
          })}
          
          {actividades.length === 0 && (
            <div className="col-span-full text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
              <span className="text-3xl block mb-2">📭</span>
              <p className="text-gray-500 font-medium">No hay actividades registradas en el banco aún.</p>
            </div>
          )}
        </div>
      </section>

      {/* Paso 2: Personalizar (Aparece dinámicamente) */}
      {actividadSeleccionada && (
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-lg sm:text-xl font-extrabold text-espau-navy mb-2 flex items-center gap-2">
            <span className="bg-espau-navy text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span> 
            Personaliza las instrucciones (Opcional)
          </h2>
          <p className="text-sm text-gray-500 mb-5 font-medium leading-relaxed pl-9">
            Agrega notas específicas para que la familia sepa cómo adaptar <strong className="text-espau-pink">{actividadSeleccionada.titulo}</strong> a lo trabajado hoy en sesión.
          </p>
          
          <div className="pl-0 sm:pl-9">
            <textarea
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
              placeholder="Ej. Juanito logró hacer el ejercicio con la pelota azul hoy. En casa, intenten hacerlo 3 veces usando su juguete favorito..."
              className="w-full h-32 px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none resize-none transition-all text-base placeholder:text-gray-400"
              disabled={guardando}
            />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
              <button 
                onClick={() => router.push(`/terapeuta/paciente/${pacienteId}`)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors active:scale-[0.98]"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button 
                onClick={handleAsignar}
                disabled={guardando}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-espau-blue text-white hover:bg-opacity-90 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {guardando ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Asignando...
                  </>
                ) : (
                  'Asignar Tarea'
                )}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}