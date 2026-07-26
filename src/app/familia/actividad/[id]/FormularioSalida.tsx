'use client';

import React, { useState } from 'react';

interface FormularioSalidaProps {
  onSubmit: (datos: {
    quienRealizo: string;
    comoSeSintio: string;
    validacion: string;
  }) => void;
  isSubmitting?: boolean;
  // NUEVO: Recibimos la pregunta dinámica
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

  // Usamos la pregunta de la base de datos, o un fallback si está vacía
  const preguntaDinamica = preguntaValidacion || '¿Cómo le fue con este ejercicio?';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-6">
      
      {/* Pregunta 1: ¿Quién eres? */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <label htmlFor="quienRealizo" className="block text-gray-800 font-semibold mb-2">
          ¿Quién apoyó en esta actividad? *
        </label>
        <select
          id="quienRealizo"
          name="quienRealizo"
          required
          value={formData.quienRealizo}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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

      {/* Pregunta 2: ¿Cómo te sentiste? */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <label htmlFor="comoSeSintio" className="block text-gray-800 font-semibold mb-2">
          ¿Cómo se sintieron durante el ejercicio? *
        </label>
        <textarea
          id="comoSeSintio"
          name="comoSeSintio"
          required
          rows={3}
          placeholder="Ej: Nos costó un poco al principio, pero luego lo logró..."
          value={formData.comoSeSintio}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
        />
      </div>

      {/* Pregunta 3: Validación DINÁMICA */}
      <div className="bg-[#F4F7FF] p-5 rounded-xl border border-blue-100 shadow-sm">
        <label htmlFor="validacion" className="block text-[#1E3A8A] font-semibold mb-3">
          {preguntaDinamica} *
        </label>
        <textarea
          id="validacion"
          name="validacion"
          required
          rows={3}
          placeholder="Escribe tu respuesta aquí..."
          value={formData.validacion}
          onChange={handleChange}
          className="w-full p-3 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-gray-700"
        />
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
      >
        {isSubmitting ? (
          <span>Enviando...</span>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Enviar y Finalizar
          </>
        )}
      </button>
    </form>
  );
}