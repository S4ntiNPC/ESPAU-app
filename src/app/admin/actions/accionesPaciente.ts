'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false, 
    },
  }
)

export async function asignarPaciente(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const fecha_nacimiento = formData.get('fecha_nacimiento') as string 
  const terapeuta_id = formData.get('terapeuta_id') as string
  const familia_id = formData.get('familia_id') as string

  if (!nombre || !fecha_nacimiento || !terapeuta_id || !familia_id) {
    return { error: 'Faltan datos obligatorios para el registro.' }
  }

  const { error: errorPaciente } = await supabaseAdmin
    .from('pacientes')
    .insert({
      nombre,
      fecha_nacimiento,
      terapeuta_id,
      familia_id, 
    })

  if (errorPaciente) {
    return { error: 'Error al registrar el paciente: ' + errorPaciente.message }
  }

  revalidatePath('/admin/dashboard')
  return { success: 'Paciente asignado correctamente' }
}

export async function completarActividadFamilia(formData: FormData) {
  const actividad_asignada_id = formData.get('actividad_id') as string;
  const quien_realizo = formData.get('quien_realizo') as string;
  const como_se_sintio = formData.get('como_se_sintio') as string;
  // Corregido: Se alinea con la columna 'respuesta_validacion' de SQL
  const respuesta_validacion = formData.get('respuesta_validacion') as string; 
  const evidencia_url = formData.get('evidencia_url') as string | null;

  if (!actividad_asignada_id || !quien_realizo || !como_se_sintio) {
    return { error: 'Por favor completa las preguntas de validación.' };
  }

  const { error } = await supabaseAdmin
    .from('actividades_asignadas')
    .update({
      estado: 'completada',
      fecha_completada: new Date().toISOString(),
      quien_realizo,
      como_se_sintio,
      respuesta_validacion,
      evidencia_url
    })
    .eq('id', actividad_asignada_id);

  if (error) {
    return { error: 'No pudimos guardar tu avance. Intenta de nuevo.' };
  }

  revalidatePath(`/familia/actividad/${actividad_asignada_id}`);
  revalidatePath('/familia/mis-actividades');
  revalidatePath('/terapeuta/panel');
  
  return { success: '¡Actividad completada y enviada al terapeuta con éxito!' };
}