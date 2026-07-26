'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Inicializamos el cliente con privilegios de Admin (Service Role)
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

export async function crearUsuario(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nombre = formData.get('nombre') as string
  const apellidos = formData.get('apellidos') as string // Extraemos los apellidos
  const rol = formData.get('rol') as string

  // Validación rápida para el MVP
  if (!nombre || !apellidos) {
    return { error: 'El nombre y los apellidos son obligatorios.' }
  }

  // 1. Creamos el usuario en la tabla auth.users de Supabase
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirmamos para que no requieran validación por email
    user_metadata: {
      role: rol,
      nombre: `${nombre} ${apellidos}`.trim() // En los metadatos de Auth sí podemos guardarlo junto
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  // 2. Insertamos el perfil en nuestra tabla public.perfiles
  if (authData.user) {
    const { error: profileError } = await supabaseAdmin
      .from('perfiles')
      .insert({
        id: authData.user.id,
        nombre: nombre,       // Columna real
        apellidos: apellidos, // Columna real
        rol: rol,
      })

    if (profileError) {
      // Rollback manual: Si falla la creación del perfil, borramos el usuario de auth para no dejar datos huérfanos.
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { error: 'Error al crear el perfil público: ' + profileError.message }
    }
  }

  revalidatePath('/admin/dashboard')
  return { success: 'Usuario creado exitosamente' }
}

export async function editarUsuario(formData: FormData) {
  const id = formData.get('id') as string
  const nombre = formData.get('nombre') as string
  const apellidos = formData.get('apellidos') as string
  const rol = formData.get('rol') as string

  if (!id || !nombre || !apellidos || !rol) {
    return { error: 'Todos los campos son obligatorios.' }
  }

  // 1. Actualizamos el perfil público
  const { error: profileError } = await supabaseAdmin
    .from('perfiles')
    .update({ nombre, apellidos, rol })
    .eq('id', id)

  if (profileError) {
    return { error: 'Error al actualizar el perfil: ' + profileError.message }
  }

  // 2. Opcional pero recomendado: Sincronizamos los metadatos de auth
  await supabaseAdmin.auth.admin.updateUserById(id, {
    user_metadata: { role: rol, nombre: `${nombre} ${apellidos}`.trim() }
  })

  revalidatePath('/admin/dashboard')
  return { success: 'Usuario actualizado correctamente' }
}

export async function eliminarUsuario(id: string) {
  if (!id) return { error: 'ID de usuario no proporcionado.' }

  try {
    // 1. Borramos el perfil público (haciéndolo explícito por seguridad)
    const { error: profileError } = await supabaseAdmin
      .from('perfiles')
      .delete()
      .eq('id', id)

    if (profileError) throw new Error('Error al eliminar el perfil: ' + profileError.message)

    // 2. Borramos las credenciales en Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (authError) throw new Error('Error al eliminar credenciales: ' + authError.message)

    revalidatePath('/admin/dashboard')
    return { success: 'Usuario eliminado exitosamente' }
  } catch (error: unknown) {
    // SOLUCIÓN: Validamos estrictamente que el error atrapado sea una instancia de Error
    if (error instanceof Error) {
      return { error: error.message }
    }
    // Fallback por si lo que se lanzó (throw) no fue un objeto de tipo Error
    return { error: 'Ocurrió un error inesperado al eliminar el usuario.' }
  }
}

// --- ACCIONES PARA EL BANCO DE ACTIVIDADES (ADMIN) ---

export async function editarActividad(formData: FormData) {
  const id = formData.get('id') as string
  const titulo = formData.get('titulo') as string
  const explicacion = formData.get('explicacion') as string
  const pregunta_validacion = formData.get('pregunta_validacion') as string

  if (!id || !titulo || !explicacion) {
    return { error: 'El título y la explicación son obligatorios.' }
  }

  const { error } = await supabaseAdmin
    .from('banco_actividades')
    .update({ 
      titulo, 
      explicacion, 
      pregunta_validacion: pregunta_validacion || null // Si está vacío, guardamos null
    })
    .eq('id', id)

  if (error) return { error: 'Error al actualizar actividad: ' + error.message }
  
  revalidatePath('/admin/banco-actividades')
  return { success: 'Actividad actualizada correctamente' }
}

export async function eliminarActividad(id: string) {
  if (!id) return { error: 'ID de actividad no proporcionado.' }

  const { error } = await supabaseAdmin
    .from('banco_actividades')
    .delete()
    .eq('id', id)

  if (error) {
    // 23503 es el código de PostgreSQL para "Foreign Key Violation"
    if (error.code === '23503') {
      return { 
        error: 'No puedes eliminar esta actividad porque ya ha sido asignada a uno o más pacientes. Para proteger el expediente clínico, no se puede borrar.' 
      }
    }
    return { error: 'Error al eliminar actividad: ' + error.message }
  }
  
  revalidatePath('/admin/banco-actividades')
  return { success: 'Actividad eliminada exitosamente' }
}