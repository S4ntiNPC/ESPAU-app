'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Actividad {
  estado: string;
  quien_realizo: string | null;
}

// Actualizamos la interfaz eliminando 'apellidos'
interface Paciente {
  id: string;
  nombre: string;
  terapeuta: { nombre: string; apellidos: string } | null;
  actividades_asignadas: Actividad[];
}

export default function GraficasMetricas({ pacientes }: { pacientes: Paciente[] }) {
  const [pacienteId, setPacienteId] = useState<string>('todos');

  const datosProcesados = useMemo(() => {
    let actividadesProcesar: Actividad[] = [];
    let terapeutaActual = 'Varios (Vista Global)';

    if (pacienteId === 'todos') {
      actividadesProcesar = pacientes.flatMap(p => p.actividades_asignadas || []);
    } else {
      const pacienteSeleccionado = pacientes.find(p => p.id === pacienteId);
      actividadesProcesar = pacienteSeleccionado?.actividades_asignadas || [];
      if (pacienteSeleccionado?.terapeuta) {
        terapeutaActual = `${pacienteSeleccionado.terapeuta.nombre} ${pacienteSeleccionado.terapeuta.apellidos}`;
      } else {
        terapeutaActual = 'Sin terapeuta asignado';
      }
    }

    const completadas = actividadesProcesar.filter(a => a.estado === 'completada').length;
    const pendientes = actividadesProcesar.length - completadas;
    const datosCumplimiento = [
      { name: 'Completadas', value: completadas, color: '#22c55e' },
      { name: 'Pendientes', value: pendientes, color: '#eab308' }
    ];

    const conteoApoyo: Record<string, number> = {};
    actividadesProcesar.forEach(act => {
      if (act.estado === 'completada') {
        const cuidador = act.quien_realizo?.trim() || 'No especificado';
        conteoApoyo[cuidador] = (conteoApoyo[cuidador] || 0) + 1;
      }
    });

    const datosApoyo = Object.keys(conteoApoyo).map(key => ({
      name: key,
      cantidad: conteoApoyo[key]
    })).sort((a, b) => b.cantidad - a.cantidad);

    return { datosCumplimiento, datosApoyo, terapeutaActual, total: actividadesProcesar.length };
  }, [pacientes, pacienteId]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-slate-600 mb-2">Filtrar por Paciente</label>
          <select 
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
          >
            <option value="todos">Resumen Global (Todos los pacientes)</option>
            {/* EL FIX: Solo mostramos el nombre del paciente */}
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-auto bg-blue-50 p-4 rounded-lg border border-blue-100 flex-1 md:ml-8">
          <p className="text-sm text-blue-800 font-medium uppercase tracking-wide mb-1">Terapeuta Asignado</p>
          <p className="text-xl font-bold text-blue-900">{datosProcesados.terapeutaActual}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Seguimiento de Actividades</h3>
          <p className="text-sm text-slate-500 mb-6">Total de actividades asignadas: <span className="font-bold text-slate-700">{datosProcesados.total}</span></p>
          
          {datosProcesados.total === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg">No hay datos suficientes</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosProcesados.datosCumplimiento}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {datosProcesados.datosCumplimiento.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} actividades`, 'Cantidad']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Red de Apoyo en Casa</h3>
          <p className="text-sm text-slate-500 mb-6">Frecuencia de participación por familiar.</p>

          {datosProcesados.datosApoyo.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg">No hay evidencias registradas</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosProcesados.datosApoyo} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => [`${value} veces`, 'Apoyos']} />
                  <Bar dataKey="cantidad" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}