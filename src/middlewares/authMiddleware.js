import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Inicializa las variables de entorno

// Middleware para la autenticación
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }

  try {
    const tokenUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = tokenUser.usuario; // Asigna el usuario al request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token no válido' });
  }
};

export default authMiddleware
