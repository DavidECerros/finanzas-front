const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; // <-- Ahora lee desde .env

exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  try {
    // 1. Verificar si el usuario ya existe
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ message: 'El usuario con este email ya existe.' });
    }
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 es "no rows found"
        console.error('Error al buscar usuario existente:', fetchError);
        return res.status(500).json({ message: 'Error interno del servidor al verificar usuario.' });
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insertar nuevo usuario en Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        { email, password_hash: hashedPassword }
      ])
      .select() // Retorna los datos del usuario insertado
      .single();

    if (insertError) {
      console.error('Error al registrar usuario en Supabase:', insertError);
      return res.status(500).json({ message: 'Error al registrar usuario.' });
    }

    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: newUser.id });

  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  try {
    // 1. Buscar usuario por email
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      if (fetchError && fetchError.code === 'PGRST116') { // No rows found
        return res.status(401).json({ message: 'Credenciales inválidas.' });
      }
      console.error('Error al buscar usuario:', fetchError);
      return res.status(500).json({ message: 'Error interno del servidor al buscar usuario.' });
    }

    // 2. Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Generar token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Inicio de sesión exitoso', token, userId: user.id });

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};