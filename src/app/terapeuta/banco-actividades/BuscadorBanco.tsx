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

  // Lógica de filtrado en tiempo real
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
    <div className="bg-transparent p-1 sm:p-2">
      {/* Header del Buscador (Mobile-First táctil) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Buscar por título o palabra clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-base placeholder:text-gray-400"
          />
          <span className="absolute left-4 top-3.5 text-lg opacity-50">🔍</span>
        </div>
        
        <Link 
          href="/terapeuta/banco-actividades/crear"
          className="w-full md:w-auto text-center bg-espau-blue text-white px-6 py-3.5 rounded-xl font-bold hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <span>+</span> Nueva Actividad
        </Link>
      </div>

      {/* Grid de Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {actividadesFiltradas.map((actividad) => (
          <div key={actividad.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-soft transition-all relative flex flex-col h-full group">
            
            {/* Historial de Creación con Fix de Hidratación Seguro */}
            <div className="mb-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-block w-fit">
              Creado por {obtenerNombreCreador(actividad.perfiles)} el{' '}
              {/* Aislar la fecha en un span con suppressHydrationWarning es la forma oficial y segura en Next.js */}
              <span suppressHydrationWarning>
                {new Date(actividad.creado_en).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
              </span>
            </div>

            <h3 className="font-bold text-lg text-espau-navy mb-3 line-clamp-1 pr-10">
              {actividad.titulo}
            </h3>
            
            {/* Botón de Editar (Área táctil accesible) */}
            <Link 
              href={`/terapeuta/banco-actividades/editar/${actividad.id}`}
              className="absolute top-6 right-6 text-gray-400 hover:text-espau-blue transition-colors bg-gray-50 hover:bg-espau-bgStart rounded-full p-2 border border-gray-100 hover:border-espau-blue/20 shadow-sm"
              title="Editar actividad"
            >
              ✏️
            </Link>

            <p className="text-sm text-gray-500 mb-6 line-clamp-3 flex-grow leading-relaxed">
              {actividad.explicacion}
            </p>
            
            {/* Indicadores Visuales (Etiquetas dinámicas) */}
            <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-gray-100">
              {actividad.pregunta_validacion && (
                <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-lg font-bold border border-emerald-100">
                  ❓ Validada
                </span>
              )}
              {actividad.apoyos_visuales_url && (
                <span className="bg-espau-blue/10 text-espau-blue text-xs px-3 py-1.5 rounded-lg font-bold border border-espau-blue/20">
                  🖼️ Apoyos
                </span>
              )}
              {actividad.tips_extra && (
                <span className="bg-espau-pink/10 text-espau-pink text-xs px-3 py-1.5 rounded-lg font-bold border border-espau-pink/20">
                  💡 Tips
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Estado Vacío Amigable */}
        {actividadesFiltradas.length === 0 && (
          <div className="col-span-full text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <span className="text-4xl mb-3 block">📭</span>
            <p className="text-gray-500 font-medium text-lg">No se encontraron actividades.</p>
            <p className="text-sm text-gray-400 mt-2">Intenta con otros términos o crea una nueva.</p>
          </div>
        )}
      </div>
    </div>
  );
}