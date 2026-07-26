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
  if (porcentajeSeguimiento >= 70) nivelInvolucramiento = 'Alto';
  else if (porcentajeSeguimiento >= 40) nivelInvolucramiento = 'Medio';

  return (
    <div className="mb-10">
      {/* Encabezado con Enlace a la Vista Detallada */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Métricas de la Plataforma</h2>
        <Link 
          href="/admin/dashboard/metricas" 
          className="text-sm font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          Ver Reporte Detallado &rarr;
        </Link>
      </div>

      {/* Contenedor de Tarjetas (Tu lógica original intacta) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta: Porcentaje de Seguimiento */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Seguimiento Global</h3>
          <p className="text-4xl font-bold text-blue-600">{porcentajeSeguimiento}%</p>
          <p className="text-xs text-gray-400 mt-2">Actividades completadas vs asignadas</p>
        </div>

        {/* Tarjeta: Nivel de Involucramiento */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Involucramiento Promedio</h3>
          <p className={`text-3xl font-bold ${
            nivelInvolucramiento === 'Alto' ? 'text-green-500' : 
            nivelInvolucramiento === 'Medio' ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {nivelInvolucramiento}
          </p>
          <p className="text-xs text-gray-400 mt-2">Basado en constancia de la familia</p>
        </div>

        {/* Tarjeta: Quién Apoyó */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Apoyo Principal en Casa</h3>
          <p className="text-2xl font-bold text-purple-600 capitalize">{cuidadorPrincipal}</p>
          <p className="text-xs text-gray-400 mt-2">Cuidador con más registros</p>
        </div>
      </div>
    </div>
  );
}