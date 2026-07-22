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

// Agrega esto al final de tu archivo src/app/admin/actions.ts

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