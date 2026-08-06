import React from 'react';
import Link from 'next/link';

// Interfaces basadas en tu esquema SQL actual
interface ActividadAsignada {
  id: string;
  estado: 'pendiente' | 'completada';
  quien_realizo: string | null;
}

interface MetricasProps {
  actividades: ActividadAsignada[];
}

export default function MetricasDashboard({ actividades }: MetricasProps) {
  // Lógica MVP para calcular métricas
  const totalActividades = actividades.length || 1; // Evitar división por cero
  const completadas = actividades.filter(a => a.estado === 'completada').length;
  
  // 1. Porcentaje de seguimiento
  const porcentajeSeguimiento = Math.round((completadas / totalActividades) * 100);

  // 2. Quién apoyó (Frecuencia de cuidadores)
  const cuidadores = actividades
    .filter(a => a.estado === 'completada' && a.quien_realizo)
    .reduce((acc, curr) => {
      const cuidador = curr.quien_realizo!;
      acc[cuidador] = (acc[cuidador] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const cuidadorPrincipal = Object.keys(cuidadores).length > 0 
    ? Object.keys(cuidadores).reduce((a, b) => cuidadores[a] > cuidadores[b] ? a : b)
    : 'Sin datos';

  // 3. Nivel de involucramiento (Métrica simplificada para el MVP)
  // MVP: Si el seguimiento es > 70% es Alto, > 40% Medio, < 40% Bajo
  let nivelInvolucramiento = 'Bajo';
  let colorInvolucramiento = 'text-rose-500'; // Colores semánticos más suaves
  
  if (porcentajeSeguimiento >= 70) {
    nivelInvolucramiento = 'Alto';
    colorInvolucramiento = 'text-emerald-500';
  } else if (porcentajeSeguimiento >= 40) {
    nivelInvolucramiento = 'Medio';
    colorInvolucramiento = 'text-amber-500';
  }

  return (
    <div className="mb-6 sm:mb-10">
      {/* Encabezado con Enlace a la Vista Detallada */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-espau-navy">Métricas de la Plataforma</h2>
        <Link 
          href="/admin/dashboard/metricas" 
          className="w-full sm:w-auto text-center text-sm font-semibold text-espau-blue bg-espau-blue/10 hover:bg-espau-blue/20 px-5 py-3.5 sm:py-2.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Ver Reporte Detallado &rarr;
        </Link>
      </div>

      {/* Contenedor de Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Tarjeta: Porcentaje de Seguimiento */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-white/50 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
          <h3 className="text-gray-400 text-xs sm:text-sm font-bold mb-3 uppercase tracking-wider">
            Seguimiento Global
          </h3>
          <p className="text-4xl sm:text-5xl font-extrabold text-espau-blue">
            {porcentajeSeguimiento}%
          </p>
          <p className="text-xs text-gray-400 mt-3 font-medium">
            Actividades completadas vs asignadas
          </p>
        </div>

        {/* Tarjeta: Nivel de Involucramiento */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-white/50 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
          <h3 className="text-gray-400 text-xs sm:text-sm font-bold mb-3 uppercase tracking-wider">
            Involucramiento
          </h3>
          <p className={`text-3xl sm:text-4xl font-extrabold ${colorInvolucramiento}`}>
            {nivelInvolucramiento}
          </p>
          <p className="text-xs text-gray-400 mt-3 font-medium">
            Basado en constancia de la familia
          </p>
        </div>

        {/* Tarjeta: Quién Apoyó */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-white/50 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300 sm:col-span-2 md:col-span-1">
          <h3 className="text-gray-400 text-xs sm:text-sm font-bold mb-3 uppercase tracking-wider">
            Apoyo Principal
          </h3>
          <p className="text-2xl sm:text-3xl font-extrabold text-espau-pink capitalize w-full truncate px-2">
            {cuidadorPrincipal}
          </p>
          <p className="text-xs text-gray-400 mt-3 font-medium">
            Cuidador con más registros
          </p>
        </div>

      </div>
    </div>
  );
}