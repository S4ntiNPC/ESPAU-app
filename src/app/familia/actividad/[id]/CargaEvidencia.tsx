'use client';

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface CargaEvidenciaProps {
  onFileSelected: (file: File | null) => void;
}

export default function CargaEvidencia({ onFileSelected }: CargaEvidenciaProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      let processedFile = file;

      // 1. Optimización si es imagen
      if (file.type.startsWith('image/')) {
        const options = {
          maxSizeMB: 1, // Máximo 1MB
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        };
        processedFile = await imageCompression(file, options);
        
        const objectUrl = URL.createObjectURL(processedFile);
        setPreview(objectUrl);
      } 
      // 2. Validación MVP si es video (Límite: 25MB)
      else if (file.type.startsWith('video/')) {
        const maxVideoSize = 25 * 1024 * 1024; // 25 Megabytes
        if (file.size > maxVideoSize) {
          throw new Error('El video es muy pesado. Por favor, graba un clip más corto (máximo 15-20 segundos).');
        }
        setPreview(null);
      }

      setFileName(processedFile.name);
      onFileSelected(processedFile);
    } catch (err) {
      // Aplicamos Type Narrowing para evitar el uso de 'any'
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al procesar tu archivo. Intenta de nuevo.');
      }
      handleRemove();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
    onFileSelected(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
      <h3 className="text-gray-800 font-semibold mb-2">Sube tu evidencia</h3>
      <p className="text-sm text-gray-500 mb-4">
        Toma una foto o graba un video corto del ejercicio.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!fileName ? (
        <div className={`relative border-2 border-dashed ${isProcessing ? 'border-gray-300' : 'border-blue-300'} rounded-xl p-8 text-center hover:bg-blue-50 transition-colors`}>
          <input
            type="file"
            accept="video/*,image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={isProcessing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Subir evidencia fotográfica o de video"
          />
          <div className="flex flex-col items-center justify-center gap-3">
            {isProcessing ? (
              <>
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 font-medium">Optimizando archivo...</span>
              </>
            ) : (
              <>
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-blue-600 font-medium">Tocar para abrir la cámara</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={preview} alt="Vista previa" className="w-32 h-32 object-cover rounded-lg mb-3 shadow-sm" />
          ) : (
            <div className="w-32 h-32 bg-blue-100 text-blue-500 rounded-lg mb-3 flex flex-col items-center justify-center shadow-sm">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-semibold">Video Listo</span>
            </div>
          )}
          <span className="text-sm text-gray-700 truncate max-w-full mb-3 px-2">{fileName}</span>
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