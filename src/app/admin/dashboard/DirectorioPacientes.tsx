'use client';

import { useState } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { useRouter } from 'next/navigation';

interface PerfilBasico {
  nombre: string;
  apellidos: string | null;
}

interface OpcionSelect {
  id: string;
  nombre_completo: string;
}

interface PacienteAdmin {
  id: string;
  nombre: string;
  fecha_nacimiento: string;
  terapeuta_id: string | null;
  familia_id: string | null;
  terapeuta: PerfilBasico | null;
  familia: PerfilBasico | null;
}

export default function DirectorioPacientes({ 
  pacientes,
  terapeutas,
  familias
}: { 
  pacientes: PacienteAdmin[],
  terapeutas: OpcionSelect[],
  familias: OpcionSelect[]
}) {
  const supabase = createClient();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para Modal de Edición Básica
  const [editingPaciente, setEditingPaciente] = useState<PacienteAdmin | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '', fecha_nacimiento: '' });

  // Estados para Modal de Gestión de Vínculos
  const [linkingPaciente, setLinkingPaciente] = useState<PacienteAdmin | null>(null);
  const [linkForm, setLinkForm] = useState({ terapeuta_id: '', familia_id: '' });

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return '-';
    const hoy = new Date();
    const cumpleanos = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const m = hoy.getMonth() - cumpleanos.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edad--;
    }
    return edad;
  };

  // --- ACCIONES MVP ---

  const handleEliminar = async (id: string) => {
    if (!window.confirm('¿Dar de baja a este paciente? Sus datos históricos se mantendrán ocultos por seguridad.')) return;
    setIsProcessing(true);
    const { error } = await supabase.from('pacientes').update({ inactivo: true }).eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    setIsProcessing(false);
    router.refresh();
  };

  const abrirModalEdicion = (paciente: PacienteAdmin) => {
    setEditingPaciente(paciente);
    setEditForm({ nombre: paciente.nombre, fecha_nacimiento: paciente.fecha_nacimiento });
  };

  const guardarEdicion = async () => {
    if (!editingPaciente) return;
    setIsProcessing(true);
    const { error } = await supabase
      .from('pacientes')
      .update({ nombre: editForm.nombre, fecha_nacimiento: editForm.fecha_nacimiento })
      .eq('id', editingPaciente.id);

    if (error) alert('Error al actualizar: ' + error.message);
    else { setEditingPaciente(null); router.refresh(); }
    setIsProcessing(false);
  };

  const abrirModalVinculos = (paciente: PacienteAdmin) => {
    setLinkingPaciente(paciente);
    setLinkForm({
      terapeuta_id: paciente.terapeuta_id || '',
      familia_id: paciente.familia_id || ''
    });
  };

  const guardarVinculos = async () => {
    if (!linkingPaciente) return;
    setIsProcessing(true);
    
    // Si el valor está vacío, enviamos null para desvincular
    const { error } = await supabase
      .from('pacientes')
      .update({ 
        terapeuta_id: linkForm.terapeuta_id || null, 
        familia_id: linkForm.familia_id || null 
      })
      .eq('id', linkingPaciente.id);

    if (error) alert('Error al actualizar vínculos: ' + error.message);
    else { setLinkingPaciente(null); router.refresh(); }
    setIsProcessing(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white p-6 md:p-8 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-espau-navy">Directorio de Pacientes</h2>
          <p className="text-sm text-gray-500">Listado general y enlaces activos de terapia.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b-2 border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              <th className="pb-3 px-4">Paciente</th>
              <th className="pb-3 px-4">Edad</th>
              <th className="pb-3 px-4">Terapeuta Asignado</th>
              <th className="pb-3 px-4">Cuidador (Familia)</th>
              <th className="pb-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {pacientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 bg-gray-50/50 rounded-xl">
                  No hay pacientes activos registrados en el sistema.
                </td>
              </tr>
            ) : (
              pacientes.map((paciente) => (
                <tr key={paciente.id} className="border-b border-gray-50 hover:bg-white transition-colors">
                  <td className="py-4 px-4 font-bold text-espau-navy">{paciente.nombre}</td>
                  <td className="py-4 px-4">{calcularEdad(paciente.fecha_nacimiento)} años</td>
                  <td className="py-4 px-4">
                    {paciente.terapeuta ? (
                      <span className="bg-espau-bgStart text-espau-blue px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100">
                        {paciente.terapeuta.nombre} {paciente.terapeuta.apellidos || ''}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Sin asignar</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {paciente.familia ? (
                      <span className="bg-espau-bgEnd text-espau-pink px-3 py-1.5 rounded-full text-xs font-medium border border-pink-100">
                        {paciente.familia.nombre} {paciente.familia.apellidos || ''}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Sin asignar</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right space-x-3">
                    <button 
                      onClick={() => abrirModalEdicion(paciente)}
                      disabled={isProcessing}
                      className="text-espau-blue hover:text-blue-800 font-medium text-xs transition-colors disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => abrirModalVinculos(paciente)}
                      disabled={isProcessing}
                      className="text-orange-500 hover:text-orange-700 font-medium text-xs transition-colors disabled:opacity-50"
                    >
                      Vínculos
                    </button>
                    <button 
                      onClick={() => handleEliminar(paciente.id)}
                      disabled={isProcessing}
                      className="text-red-500 hover:text-red-700 font-medium text-xs transition-colors disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL MVP DE EDICIÓN --- */}
      {editingPaciente && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-espau-navy mb-4">Editar Paciente</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-espau-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  value={editForm.fecha_nacimiento}
                  onChange={(e) => setEditForm({...editForm, fecha_nacimiento: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-espau-blue"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingPaciente(null)} disabled={isProcessing} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-full transition-colors">Cancelar</button>
              <button onClick={guardarEdicion} disabled={isProcessing} className="px-5 py-2 bg-espau-blue hover:bg-blue-600 text-white font-semibold rounded-full transition-colors shadow-md shadow-blue-200">
                {isProcessing ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL MVP DE GESTIÓN DE VÍNCULOS --- */}
      {linkingPaciente && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-espau-navy mb-1">Gestionar Vínculos</h3>
            <p className="text-sm text-gray-500 mb-6">Asigna o desvincula responsables para <strong>{linkingPaciente.nombre}</strong>.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terapeuta Asignado</label>
                <select 
                  value={linkForm.terapeuta_id}
                  onChange={(e) => setLinkForm({...linkForm, terapeuta_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-espau-blue bg-white"
                >
                  <option value="">Ninguno / Desvincular</option>
                  {terapeutas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre_completo}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuidador (Familia)</label>
                <select 
                  value={linkForm.familia_id}
                  onChange={(e) => setLinkForm({...linkForm, familia_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-espau-blue bg-white"
                >
                  <option value="">Ninguno / Desvincular</option>
                  {familias.map(f => (
                    <option key={f.id} value={f.id}>{f.nombre_completo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setLinkingPaciente(null)} disabled={isProcessing} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-full transition-colors">Cancelar</button>
              <button onClick={guardarVinculos} disabled={isProcessing} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors shadow-md shadow-orange-200">
                {isProcessing ? 'Guardando...' : 'Actualizar Vínculos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}