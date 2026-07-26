'use client';

import React, { useState } from 'react';

interface CargaEvidenciaProps {
  onFileSelected: (file: File | null) => void;
}

export default function CargaEvidencia({ onFileSelected }: CargaEvidenciaProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelected(file);

      // Si es imagen, creamos un preview rápido
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
      } else {
        setPreview(null); // Es video u otro archivo
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    onFileSelected(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
      <h3 className="text-gray-800 font-semibold mb-2">Sube tu evidencia</h3>
      <p className="text-sm text-gray-500 mb-4">
        Toma una foto o graba un video corto del ejercicio.
      </p>

      {!fileName ? (
        <div className="relative border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:bg-blue-50 transition-colors">
          <input
            type="file"
            accept="video/*,image/*"
            // El atributo capture="environment" abre la cámara trasera en móviles automáticamente
            capture="environment"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Subir evidencia fotográfica o de video"
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-blue-600 font-medium">Tocar para abrir la cámara</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
          {preview ? (
             /* eslint-disable-next-line @next/next/no-img-element */
            <img src={preview} alt="Vista previa" className="w-32 h-32 object-cover rounded-lg mb-3 shadow-sm" />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center shadow-sm">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <span className="text-sm text-gray-700 truncate max-w-full mb-3">{fileName}</span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-500 text-sm font-medium hover:text-red-700"
          >
            Eliminar y tomar otra
          </button>
        </div>
      )}
    </div>
  );
}