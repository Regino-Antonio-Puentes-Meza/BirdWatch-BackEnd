import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tuClaveSecretaJWT';

const authMiddleware = (req, res, next) => {
    try {
        // Obtener el token de acceso de los encabezados
        const accessToken = req.headers.authorization?.split(' ')[1];

        if (!accessToken) {
            console.log('401 - No autorizado: Token no proporcionado');
            return res.status(401).json({ message: 'No autorizado: Token no proporcionado' });
        }

        // Verificar el token de acceso
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        req.user = decoded; // Almacena la información del usuario en el objeto req

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('401 - No autorizado: Token expirado');
            return res.status(401).json({ message: 'No autorizado: Token expirado' });
        }
        console.log('401 - No autorizado: Token inválido');
        return res.status(401).json({ message: 'No autorizado: Token inválido' });
    }
};

export default authMiddleware;