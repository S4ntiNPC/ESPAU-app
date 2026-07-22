'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Retornamos a la página de login con un parámetro de error
    redirect('/login?error=Credenciales incorrectas')
  }

  // Limpiamos la caché y redirigimos a la raíz. 
  // El middleware se encargará de enviarlo a su panel correspondiente (/admin, /terapeuta o /familia)
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Limpiamos la caché y mandamos al usuario de vuelta al login
  revalidatePath('/', 'layout')
  redirect('/login')
}