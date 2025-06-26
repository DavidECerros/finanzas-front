const { createClient } = require('@supabase/supabase-js');

// Ahora leemos las credenciales desde las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Las variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY no están definidas en el archivo .env.');
  console.error('Por favor, configura tus credenciales de Supabase en el archivo .env.');
  process.exit(1); // Salir de la aplicación si no se configuran las credenciales
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;