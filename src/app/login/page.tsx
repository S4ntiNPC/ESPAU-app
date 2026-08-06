import Image from 'next/image';
import { login } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-soft p-8 sm:p-10">
        
        {/* Cabecera y Logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-24 h-24 mb-6 relative">
            {/* Asegúrate de guardar el logo de ESPAU en la carpeta /public con el nombre logo-espau.png */}
            <Image 
              src="/logo-espau.png" 
              alt="Logo ESPAU" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-espau-navy">
            ¡Hola! Te damos la bienvenida
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Ingresa a tu cuenta para continuar con el seguimiento.
          </p>
        </div>

        {/* Formulario */}
        <form className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="ejemplo@correo.com"
              required
              className="input-espau"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="input-espau"
            />
          </div>

          {/* Manejo de Errores UI */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          <button
            formAction={login}
            className="w-full bg-espau-blue hover:bg-opacity-90 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl transition-all mt-4 shadow-sm"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </main>
  );
}