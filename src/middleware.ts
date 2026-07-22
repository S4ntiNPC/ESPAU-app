import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Clonamos la respuesta para poder inyectarle cookies si es necesario
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Creamos el cliente de Supabase para el Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

// 3. Obtenemos el usuario actual de forma segura
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Lógica de Enrutamiento
  const path = request.nextUrl.pathname
  const isLoginRoute = path.startsWith('/login')
  const isProtectedRoute = 
    path.startsWith('/admin') || 
    path.startsWith('/terapeuta') || 
    path.startsWith('/familia')

  // Si no hay usuario y trata de entrar a un área privada, lo mandamos al login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si HAY usuario, controlamos a dónde puede ir
  if (user) {
    // NUEVO: Consultamos el rol directamente desde la tabla 'perfiles'
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    // Si encontramos el rol lo usamos, si no, asumimos 'familia' por seguridad extrema
    const userRole = perfil?.rol || 'familia'

    // Si está en login o en la raíz (/), lo empujamos a su panel correspondiente
    if (isLoginRoute || path === '/') {
      const url = request.nextUrl.clone()
      if (userRole === 'admin') url.pathname = '/admin/dashboard'
      else if (userRole === 'terapeuta') url.pathname = '/terapeuta/panel'
      else url.pathname = '/familia/mis-actividades'
      return NextResponse.redirect(url)
    }

    // Seguridad extra: Evitar que un rol entre a la URL de otro rol
    if (path.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (path.startsWith('/terapeuta') && userRole !== 'terapeuta') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (path.startsWith('/familia') && userRole !== 'familia' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

// 5. Configuramos en qué rutas debe correr el middleware
export const config = {
  matcher: [
    /*
     * Ignora las rutas internas de Next.js, archivos estáticos e imágenes.
     * Ejecuta el middleware en todo lo demás.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}