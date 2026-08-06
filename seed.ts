import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno locales (.env.local)
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function runSeeder() {
  console.log('🌱 Iniciando Seeder de ESPAU...');

  try {
    // 1. CREAR USUARIOS DE PRUEBA (AUTH Y PERFILES)
    console.log('👤 Creando perfiles de usuarios...');
    
    // 👑 NUEVO: Administrador (Dirección)
    const { data: authAdmin, error: errAdmin } = await supabaseAdmin.auth.admin.createUser({
      email: 'liss.admin@espau.org',
      password: 'password123',
      email_confirm: true,
    });
    if (errAdmin) throw errAdmin;

    await supabaseAdmin.from('perfiles').insert({
      id: authAdmin.user.id,
      rol: 'admin',
      nombre: 'Liss',
      apellidos: 'Dirección',
      telefono: '6140000000'
    });
    console.log('   ✓ Administrador creado');

    // 👩‍⚕️ Terapeuta
    const { data: authTerapeuta, error: errT1 } = await supabaseAdmin.auth.admin.createUser({
      email: 'magaly.terapeuta@espau.org',
      password: 'password123',
      email_confirm: true,
    });
    if (errT1) throw errT1;

    await supabaseAdmin.from('perfiles').insert({
      id: authTerapeuta.user.id,
      rol: 'terapeuta',
      nombre: 'Magaly',
      apellidos: 'Robles',
      telefono: '6141234567'
    });
    console.log('   ✓ Terapeuta creada');

    // 👨‍👩‍👦 Familia
    const { data: authFamilia, error: errF1 } = await supabaseAdmin.auth.admin.createUser({
      email: 'familia.gonzalez@ejemplo.com',
      password: 'password123',
      email_confirm: true,
    });
    if (errF1) throw errF1;

    await supabaseAdmin.from('perfiles').insert({
      id: authFamilia.user.id,
      rol: 'familia',
      nombre: 'Familia',
      apellidos: 'González',
      telefono: '6149876543'
    });
    console.log('   ✓ Familia creada');

    // 2. CREAR PACIENTE
    console.log('🧸 Registrando paciente...');
    const { data: paciente, error: errP } = await supabaseAdmin.from('pacientes').insert({
      nombre: 'Juanito González',
      fecha_nacimiento: '2018-05-14',
      expediente_clinico: 'Paciente presenta avances significativos en contacto visual. Requiere refuerzo en casa para identificación de emociones básicas.',
      terapeuta_id: authTerapeuta.user.id,
      familia_id: authFamilia.user.id,
      inactivo: false
    }).select().single();
    if (errP) throw errP;

    // 3. CREAR BANCO DE ACTIVIDADES
    console.log('📚 Llenando Banco de Actividades...');
    const { data: actividades, error: errA } = await supabaseAdmin.from('banco_actividades').insert([
      {
        titulo: 'Identificación de Emociones: Feliz y Triste',
        explicacion: 'Usaremos tarjetas visuales para que Juanito identifique las caras. Felicítalo de forma exagerada cuando acierte.',
        apoyos_visuales_url: 'https://ejemplo.com/emociones.jpg',
        tips_extra: 'Si se distrae, hagan una pausa de 5 minutos y retomen.',
        creado_por: authTerapeuta.user.id,
        pregunta_validacion: '¿Pudo identificar la cara feliz sin tu ayuda al primer intento?'
      },
      {
        titulo: 'Seguimiento de Instrucciones Simples',
        explicacion: 'Pídele a Juanito que te entregue un objeto específico de la mesa ("Dame la pelota roja").',
        apoyos_visuales_url: null,
        tips_extra: 'Usa frases cortas y claras.',
        creado_por: authTerapeuta.user.id,
        pregunta_validacion: '¿Cuántos objetos logró entregarte de manera correcta?'
      }
    ]).select();
    if (errA) throw errA;

    // 4. ASIGNAR ACTIVIDADES Y SIMULAR HISTORIAL PARA MÉTRICAS
    console.log('📊 Generando historial para estadísticas del Dashboard...');
    
    // Actividad Completada 1 (Hace 3 días - Hecha por Mamá)
    await supabaseAdmin.from('actividades_asignadas').insert({
      paciente_id: paciente.id,
      actividad_id: actividades[0].id,
      estado: 'completada',
      fecha_asignada: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      fecha_completada: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      evidencia_url: 'https://vxngvenxactastucnfvh.supabase.co/storage/v1/object/public/evidencias/demo-foto1.jpg',
      quien_realizo: 'Mamá',
      como_se_sintio: 'Motivado, se divirtió mucho.',
      respuesta_validacion: 'Sí, lo logró a la primera y sonrió.',
      instrucciones_personalizadas: 'Juanito ha estado muy receptivo, intenten hacerlo por 10 minutos.'
    });

    // Actividad Completada 2 (Hace 1 día - Hecha por Abuelo/a)
    await supabaseAdmin.from('actividades_asignadas').insert({
      paciente_id: paciente.id,
      actividad_id: actividades[1].id,
      estado: 'completada',
      fecha_asignada: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      fecha_completada: new Date().toISOString(),
      evidencia_url: null, 
      quien_realizo: 'Abuelo/a',
      como_se_sintio: 'Un poco frustrado al principio.',
      respuesta_validacion: 'Me entregó 3 objetos correctos de 5.',
      instrucciones_personalizadas: 'El abuelo puede ayudar guiando su mano al principio.'
    });

    // Actividad Pendiente (Para hoy)
    await supabaseAdmin.from('actividades_asignadas').insert({
      paciente_id: paciente.id,
      actividad_id: actividades[0].id,
      estado: 'pendiente',
      fecha_asignada: new Date().toISOString(),
    });

    console.log('\n✅ ¡Seeding completado con éxito!');
    console.log('==================================================');
    console.log('🔑 CREDENCIALES PARA LA PRESENTACIÓN:');
    console.log('--------------------------------------------------');
    console.log('🛡️  Administrador : liss.admin@espau.org');
    console.log('👩‍⚕️ Terapeuta     : magaly.terapeuta@espau.org');
    console.log('👨‍👩‍👦 Familia       : familia.gonzalez@ejemplo.com');
    console.log('Contraseña (para todos) : password123');
    console.log('==================================================\n');

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  }
}

runSeeder();