'use server'

import { createClient } from '../../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function crearActividadBanco(formData: FormData) {
  const supabase = await createClient()

  // Obtenemos el ID del administrador actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sesión expirada o no autorizada.' }
  }

  const titulo = formData.get('titulo') as string
  const explicacion = formData.get('explicacion') as string
  const apoyos_visuales_url = formData.get('apoyos_visuales_url') as string
  const tips_extra = formData.get('tips_extra') as string
  const pregunta_validacion = formData.get('pregunta_validacion') as string

  // Validación básica MVP
  if (!titulo || !explicacion) {
    return { error: 'El título y la explicación son campos obligatorios.' }
  }

  const { error } = await supabase
    .from('banco_actividades')
    .insert({
      titulo,
      explicacion,
      apoyos_visuales_url: apoyos_visuales_url || null,
      tips_extra: tips_extra || null,
      pregunta_validacion: pregunta_validacion || null, // Configuración de la encuesta de salida[cite: 2]
      creado_por: user.id
    })

  if (error) {
    return { error: 'Ocurrió un error al guardar: ' + error.message }
  }

  // Refrescamos las cachés para que la nueva actividad aparezca de inmediato
  revalidatePath('/admin/banco-actividades')
  revalidatePath('/terapeuta/banco-actividades')
  
  return { success: '¡Actividad creada y agregada al banco exitosamente!' }
}