import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tuClaveSecretaJWT';

const authMiddleware = (req, res, next) => {
    // Obtener el token de los encabezados
    const token = req.header('Authorization')?.split(' ')[1];  // Formato "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;  // Agregar los datos del token al objeto `req`
        next();  // Pasar al siguiente middleware o a la ruta
    } catch (error) {
        return res.status(401).json({ message: 'Token no válido.' });
    }
};

export default authMiddleware;
