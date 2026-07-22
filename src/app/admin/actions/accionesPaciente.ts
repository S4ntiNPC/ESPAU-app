'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// 1. Instancia con privilegios de Admin (Service Role) configurada correctamente
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false, // Evita que recoja sesiones cacheadas sin privilegios
    },
  }
)

export async function asignarPaciente(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const fecha_nacimiento = formData.get('fecha_nacimiento') as string // Rescatamos el nuevo campo
  const terapeuta_id = formData.get('terapeuta_id') as string
  const familia_id = formData.get('familia_id') as string

  // Validación de seguridad para el MVP
  if (!nombre || !fecha_nacimiento || !terapeuta_id || !familia_id) {
    return { error: 'Faltan datos obligatorios para el registro.' }
  }

  // 2. Insertamos al paciente y sus relaciones en una sola operación
  // Basado en nuestro esquema, 'familia_id' y 'terapeuta_id' son columnas directas en 'pacientes'
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

  // 3. Refrescamos la caché del dashboard
  revalidatePath('/admin/dashboard')
  return { success: 'Paciente asignado correctamente' }
}