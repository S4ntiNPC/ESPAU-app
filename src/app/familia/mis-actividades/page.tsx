import { createClient } from '../../../utils/supabase/server'
import { logout } from '../../login/actions'
import { redirect } from 'next/navigation'

export default async function FamiliaMisActividades() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-blue-50 p-4 md:p-8">
      <div className="max-w-md mx-auto md:max-w-2xl bg-white rounded-2xl shadow-sm overflow-hidden">
        
        {/* Cabecera amigable - Mobile First */}
        <header className="bg-blue-600 p-6 text-white flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">¡Hola! 👋</h1>
            <p className="opacity-90 mt-1">Aquí está tu plan de hoy para reforzar la terapia en casa.</p>
          </div>
          <form action={logout}>
            <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
              Salir
            </button>
          </form>
        </header>

        <div className="p-6">
          <h2 className="font-semibold text-gray-700 mb-4 text-lg">Actividades Pendientes</h2>
          
          {/* Tarjeta de actividad de ejemplo (Placeholder para el MVP) */}
          <div className="border-2 border-blue-100 rounded-xl p-4 flex items-center justify-between mb-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                🧩
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Ejercicio de Atención</h3>
                <p className="text-sm text-gray-500">Duración: 10 mins</p>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Iniciar
            </button>
          </div>

          {/* Área para el futuro sistema de rachas/Candy Crush */}
          <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
            <p className="text-orange-600 font-medium text-sm">
              🔥 ¡Llevas una racha de 3 días apoyando a tu pequeño!
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}