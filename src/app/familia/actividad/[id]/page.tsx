'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Upload, CheckCircle2, Video, FileText } from 'lucide-react'

export default function ActividadDetallePage() {
  const router = useRouter()
  // Usamos el hook nativo de Next.js para leer el ID de la URL
  const params = useParams() 
  const actividadId = params?.id

  const [paso, setPaso] = useState(1) // 1: Instrucciones, 2: Evidencia y Formulario, 3: Éxito
  
  // Datos mockeados para la presentación
  const actividad = {
    titulo: 'Clasificación por Colores',
    explicacion: 'Coloca frente al niño bloques de colores rojo, azul y verde. Pídele que agrupe todos los bloques del mismo color en recipientes separados.',
    tips: 'Si se frustra, ayúdale con el primer bloque de cada color. Celebra cada acierto con entusiasmo.',
  }

  if (paso === 3) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold text-green-800 mb-2">¡Excelente trabajo!</h1>
        <p className="text-green-600 mb-8">La evidencia ha sido enviada al terapeuta. Cada pequeño paso es un gran avance.</p>
        <button 
          onClick={() => router.push('/familia/mis-actividades')}
          className="bg-green-600 text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 w-full max-w-xs"
        >
          Volver a mis actividades
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header fijo */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/familia/mis-actividades')} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900 truncate">Detalle de Actividad</h1>
      </header>

      <main className="p-5 max-w-md mx-auto">
        {/* PASO 1: Explicación */}
        {paso === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">Instrucciones</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{actividad.titulo}</h2>
              <p className="mt-3 text-gray-600 leading-relaxed">{actividad.explicacion}</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Tips del Terapeuta</h3>
              </div>
              <p className="text-sm text-blue-800">{actividad.tips}</p>
            </div>

            <button 
              onClick={() => setPaso(2)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium shadow-md shadow-blue-200 mt-8"
            >
              Comenzar Actividad
            </button>
          </div>
        )}

        {/* PASO 2: Evidencia y Preguntas de Salida */}
        {paso === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            
            <section>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">1. Sube tu evidencia</h3>
              <p className="text-sm text-gray-500 mb-4">Graba directamente desde la plataforma o sube un archivo corto.</p>
              
              <label className="border-2 border-dashed border-gray-300 bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Video className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <span className="text-blue-600 font-medium">Toca para grabar</span>
                  <span className="text-gray-500 text-sm block">o seleccionar galería</span>
                </div>
                <input type="file" accept="video/*,image/*" className="hidden" />
              </label>
            </section>

            <hr className="border-gray-200" />

            <section className="space-y-5">
              <h3 className="font-bold text-gray-900 text-lg">2. Preguntas de salida</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Quién realizó la actividad con el paciente?</label>
                <select className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
                  <option value="">Selecciona una opción</option>
                  <option value="madre">Mamá</option>
                  <option value="padre">Papá</option>
                  <option value="abuela">Abuelo/a</option>
                  <option value="tia">Tío/a</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo te sentiste durante el ejercicio?</label>
                <div className="flex justify-between gap-2">
                  {['Frustrado', 'Normal', 'Feliz', 'Excelente'].map((emocion) => (
                    <button key={emocion} className="flex-1 py-2 px-1 border border-gray-200 bg-white rounded-lg text-xs font-medium text-gray-600 hover:border-blue-500 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500">
                      {emocion}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <button 
              onClick={() => setPaso(3)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium shadow-md shadow-blue-200 mt-4 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" /> Enviar Evidencia
            </button>
          </div>
        )}
      </main>
    </div>
  )
}