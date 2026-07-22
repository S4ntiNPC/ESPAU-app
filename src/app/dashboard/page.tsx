import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic' // Evitamos que Next.js cachee esta ruta

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Consultamos el rol del usuario en la tabla perfiles
  const { data: perfil, error } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  // MODO DEBUG: Mostrará exactamente qué está fallando
  if (error || !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center border border-red-100">
          <h2 className="text-xl font-bold text-red-600 mb-2">Perfil no encontrado</h2>
          
          <div className="text-left text-xs text-gray-700 bg-gray-50 p-4 rounded border mb-4 break-words">
            <p className="font-semibold text-red-500 mb-1">🔍 Datos de Diagnóstico:</p>
            <p><b>ID del Usuario logueado:</b><br/> <span className="select-all text-blue-600">{user.id}</span></p>
            <p className="mt-2"><b>Error de Supabase:</b><br/> {error?.message || 'No se devolvió ningún perfil (probablemente bloqueado por RLS)'}</p>
            <p><b>Código:</b> {error?.code || 'N/A'}</p>
          </div>

          <p className="text-gray-600 text-sm">
            Compara el <b>ID del Usuario logueado</b> de arriba con el ID que pegaste en la tabla <b>perfiles</b>. Deben ser idénticos.
          </p>
        </div>
      </div>
    )
  }

  // Redirección inteligente basada en el rol
  switch (perfil.rol) {
    case 'admin':
      redirect('/admin/dashboard')
    case 'terapeuta':
      redirect('/terapeuta/panel')
    case 'familia':
      redirect('/familia/mis-actividades')
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p>Error: Rol "{perfil.rol}" no reconocido.</p>
        </div>
      )
  }
}