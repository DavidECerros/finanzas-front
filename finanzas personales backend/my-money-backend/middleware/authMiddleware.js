const jwt = require('jsonwebtoken');

// Clave secreta para firmar y verificar tokens (leída desde .env)
const JWT_SECRET = process.env.JWT_SECRET; // ¡IMPORTANTE! Asegúrate de que esta variable esté en tu .env

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación.' });
  }

  const token = authHeader.split(' ')[1]; // Esperamos 'Bearer TOKEN'

  if (!token) {
    return res.status(401).json({ message: 'Formato de token inválido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // Adjunta el ID del usuario al objeto de solicitud
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado. Por favor, inicia sesión de nuevo.' });
    }
    console.error('Error de verificación de token:', error);
    res.status(401).json({ message: 'Token inválido.' });
  }
};

module.exports = authMiddleware;