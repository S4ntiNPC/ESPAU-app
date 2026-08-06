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

  // Clases compartidas para consistencia visual y accesibilidad táctil
  const inputClasses = "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-espau-blue focus:border-espau-blue outline-none transition-all text-base";
  const labelClasses = "block text-sm font-bold text-espau-navy mb-1.5 ml-1";

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-white/50 p-6 md:p-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-espau-navy">Directorio de Pacientes</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Listado general, gestión de expedientes y asignaciones activas.
          </p>
        </div>
      </div>

      {/* Contenedor de la Tabla (Responsive Degradation) */}
      <div className="w-full overflow-hidden rounded-2xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="text-xs text-espau-navy uppercase tracking-wider bg-espau-bgStart/50 border-b border-espau-blue/10">
              <tr>
                <th className="py-4 px-5 font-bold">Paciente</th>
                <th className="py-4 px-5 font-bold">Edad</th>
                <th className="py-4 px-5 font-bold">Terapeuta Asignado</th>
                <th className="py-4 px-5 font-bold">Cuidador (Familia)</th>
                <th className="py-4 px-5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
              {pacientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 bg-gray-50/50">
                    <span className="text-3xl block mb-2">📁</span>
                    No hay pacientes activos registrados en el sistema.
                  </td>
                </tr>
              ) : (
                pacientes.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-5 font-bold text-espau-navy">{paciente.nombre}</td>
                    <td className="py-4 px-5 font-medium">{calcularEdad(paciente.fecha_nacimiento)} años</td>
                    <td className="py-4 px-5">
                      {paciente.terapeuta ? (
                        <span className="bg-espau-bgStart/80 text-espau-blue px-3 py-1.5 rounded-lg text-xs font-bold border border-espau-blue/20">
                          {paciente.terapeuta.nombre} {paciente.terapeuta.apellidos || ''}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs font-medium bg-gray-100 px-3 py-1.5 rounded-lg">Sin asignar</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      {paciente.familia ? (
                        <span className="bg-espau-pink/10 text-espau-pink px-3 py-1.5 rounded-lg text-xs font-bold border border-espau-pink/20">
                          {paciente.familia.nombre} {paciente.familia.apellidos || ''}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs font-medium bg-gray-100 px-3 py-1.5 rounded-lg">Sin asignar</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      {/* Contenedor flexible para evitar que los botones se empalmen en pantallas pequeñas */}
                      <div className="flex flex-wrap justify-end gap-2">
                        <button 
                          onClick={() => abrirModalEdicion(paciente)}
                          disabled={isProcessing}
                          className="text-espau-blue bg-espau-blue/5 hover:bg-espau-blue/10 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors disabled:opacity-50"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => abrirModalVinculos(paciente)}
                          disabled={isProcessing}
                          className="text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors disabled:opacity-50"
                        >
                          Vínculos
                        </button>
                        {/* Botón de eliminar visible siempre y funcional en dispositivos táctiles */}
                        <button 
                          onClick={() => handleEliminar(paciente.id)}
                          disabled={isProcessing}
                          className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL MVP DE EDICIÓN --- */}
      {editingPaciente && (
        <div className="fixed inset-0 bg-espau-navy/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-white/50 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-extrabold text-espau-navy mb-6">Editar Paciente</h3>
            
            <div className="space-y-5 mb-8">
              <div>
                <label className={labelClasses}>Nombre Completo</label>
                <input 
                  type="text" 
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  value={editForm.fecha_nacimiento}
                  onChange={(e) => setEditForm({...editForm, fecha_nacimiento: e.target.value})}
                  className={inputClasses}
                />
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button 
                onClick={() => setEditingPaciente(null)} 
                disabled={isProcessing} 
                className="w-full sm:w-auto px-6 py-3.5 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button 
                onClick={guardarEdicion} 
                disabled={isProcessing} 
                className="w-full sm:w-auto px-6 py-3.5 bg-espau-blue hover:bg-opacity-90 text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
              >
                {isProcessing ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL MVP DE GESTIÓN DE VÍNCULOS --- */}
      {linkingPaciente && (
        <div className="fixed inset-0 bg-espau-navy/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-white/50 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-extrabold text-espau-navy mb-2">Gestionar Vínculos</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
              Asigna o desvincula responsables para el expediente de <strong className="text-espau-pink">{linkingPaciente.nombre}</strong>.
            </p>
            
            <div className="space-y-5 mb-8">
              <div>
                <label className={labelClasses}>Terapeuta Asignado</label>
                <select 
                  value={linkForm.terapeuta_id}
                  onChange={(e) => setLinkForm({...linkForm, terapeuta_id: e.target.value})}
                  className={`${inputClasses} cursor-pointer`}
                >
                  <option value="">Ninguno / Desvincular</option>
                  {terapeutas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre_completo}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={labelClasses}>Cuidador Principal (Familia)</label>
                <select 
                  value={linkForm.familia_id}
                  onChange={(e) => setLinkForm({...linkForm, familia_id: e.target.value})}
                  className={`${inputClasses} cursor-pointer`}
                >
                  <option value="">Ninguno / Desvincular</option>
                  {familias.map(f => (
                    <option key={f.id} value={f.id}>{f.nombre_completo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button 
                onClick={() => setLinkingPaciente(null)} 
                disabled={isProcessing} 
                className="w-full sm:w-auto px-6 py-3.5 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button 
                onClick={guardarVinculos} 
                disabled={isProcessing} 
                className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
              >
                {isProcessing ? 'Guardando...' : 'Actualizar Vínculos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}