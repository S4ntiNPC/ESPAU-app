'use client'

import { useState } from 'react';
import Link from 'next/link';

// Tipado estricto sin usar 'any'
interface Perfil {
  nombre: string;
  apellidos: string;
}

interface Actividad {
  id: string;
  titulo: string;
  explicacion: string;
  tips_extra: string | null;
  apoyos_visuales_url: string | null;
  pregunta_validacion: string | null;
  creado_en: string;
  perfiles: Perfil | Perfil[] | null;
}

export default function BuscadorBanco({ actividadesIniciales }: { actividadesIniciales: Actividad[] }) {
  const [busqueda, setBusqueda] = useState('');

  const actividadesFiltradas = actividadesIniciales.filter(act => 
    act.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    act.explicacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función segura para extraer el nombre del creador
  const obtenerNombreCreador = (perfil: Perfil | Perfil[] | null) => {
    if (!perfil) return 'Usuario Desconocido';
    if (Array.isArray(perfil)) return `${perfil[0]?.nombre} ${perfil[0]?.apellidos}`;
    return `${perfil.nombre} ${perfil.apellidos}`;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Buscar por título o palabra clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        
        <Link 
          href="/terapeuta/banco-actividades/crear"
          className="w-full md:w-auto bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-center shadow-sm"
        >
          + Nueva Actividad
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actividadesFiltradas.map((actividad) => (
          <div key={actividad.id} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col h-full relative group hover:shadow-md transition-shadow">
            
            {/* Historial de Creación */}
            <div className="mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                Creado por {obtenerNombreCreador(actividad.perfiles)} el {new Date(actividad.creado_en).toLocaleDateString()}
              </span>
            </div>

            <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1 pr-8">{actividad.titulo}</h3>
            
            {/* Botón de Editar */}
            <Link 
              href={`/terapeuta/banco-actividades/editar/${actividad.id}`}
              className="absolute top-6 right-6 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-full p-1 border border-transparent hover:border-blue-100 hover:bg-blue-50"
              title="Editar actividad"
            >
              ✏️
            </Link>

            <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">{actividad.explicacion}</p>
            
            {/* Indicadores Visuales */}
            <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-gray-100">
              {actividad.pregunta_validacion && <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-md font-medium border border-purple-100">❓ Validada</span>}
              {actividad.apoyos_visuales_url && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium border border-blue-100">🖼️ Apoyos</span>}
              {actividad.tips_extra && <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md font-medium border border-green-100">💡 Tips</span>}
            </div>
          </div>
        ))}

        {actividadesFiltradas.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No se encontraron actividades.</p>
            <p className="text-sm text-gray-400 mt-1">Intenta con otros términos o crea una nueva.</p>
          </div>
        )}
      </div>
    </div>
  );
}