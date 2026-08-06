'use client';

import React, { useState } from 'react';

interface FormularioSalidaProps {
  onSubmit: (datos: {
    quienRealizo: string;
    comoSeSintio: string;
    validacion: string;
  }) => void;
  isSubmitting?: boolean;
  preguntaValidacion?: string | null; 
}

export default function FormularioSalida({ 
  onSubmit, 
  isSubmitting = false,
  preguntaValidacion 
}: FormularioSalidaProps) {
  const [formData, setFormData] = useState({
    quienRealizo: '',
    comoSeSintio: '',
    validacion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const preguntaDinamica = preguntaValidacion || '¿Cómo les fue con este ejercicio?';

  // Clases utilitarias compartidas para inputs táctiles (Mobile-First)
  const inputClasses = "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-base placeholder:text-gray-400 text-gray-700 disabled:opacity-60";
  const labelClasses = "block text-sm sm:text-base font-bold text-espau-navy mb-2 flex items-center gap-2";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-5">
      
      {/* Pregunta 1: ¿Quién eres? (Requerimiento estricto) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
        <label htmlFor="quienRealizo" className={labelClasses}>
          <span className="text-xl">🦸‍♀️</span> ¿Quién apoyó en esta actividad? <span className="text-red-500">*</span>
        </label>
        <select
          id="quienRealizo"
          name="quienRealizo"
          required
          value={formData.quienRealizo}
          onChange={handleChange}
          className={`${inputClasses} cursor-pointer`}
          disabled={isSubmitting}
        >
          <option value="" disabled>Selecciona una opción...</option>
          <option value="madre">Mamá</option>
          <option value="padre">Papá</option>
          <option value="abuela_abuelo">Abuela / Abuelo</option>
          <option value="tia_tio">Tía / Tío</option>
          <option value="hermana_hermano">Hermana / Hermano</option>
          <option value="otro">Otro cuidador</option>
        </select>
      </div>

      {/* Pregunta 2: ¿Cómo te sentiste? (Requerimiento estricto)[cite: 2] */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
        <label htmlFor="comoSeSintio" className={labelClasses}>
          <span className="text-xl">💭</span> ¿Cómo se sintieron durante el ejercicio? <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3 ml-1 font-medium">
          Cuéntanos si hubo frustración, si fue divertido, o si notaste algún avance.
        </p>
        <textarea
          id="comoSeSintio"
          name="comoSeSintio"
          required
          rows={3}
          placeholder="Ej: Nos costó un poco al principio, pero luego lo logró muy bien..."
          value={formData.comoSeSintio}
          onChange={handleChange}
          className={`${inputClasses} resize-none min-h-[100px]`}
          disabled={isSubmitting}
        />
      </div>

      {/* Pregunta 3: Validación basada en el ejercicio (Requerimiento estricto)[cite: 2] */}
      <div className="bg-espau-bgStart/30 p-5 sm:p-6 rounded-3xl border border-espau-blue/20 shadow-sm">
        <label htmlFor="validacion" className={`${labelClasses} text-espau-blue`}>
          <span className="text-xl">🎯</span> {preguntaDinamica} <span className="text-espau-pink">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3 ml-1 font-medium">
          Esta pregunta nos ayuda a saber cómo adaptar la próxima terapia.
        </p>
        <textarea
          id="validacion"
          name="validacion"
          required
          rows={3}
          placeholder="Escribe tu respuesta aquí..."
          value={formData.validacion}
          onChange={handleChange}
          className={`${inputClasses} resize-none min-h-[100px] bg-white`}
          disabled={isSubmitting}
        />
      </div>

      {/* Botón de Envío: Grande y claro para finalizar el flujo */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-espau-blue hover:bg-opacity-90 text-white font-bold py-4 px-6 rounded-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando evidencia...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Enviar y Finalizar
            </>
          )}
        </button>
      </div>
    </form>
  );
}