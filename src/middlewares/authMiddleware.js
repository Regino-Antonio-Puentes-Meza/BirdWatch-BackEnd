import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tuClaveSecretaJWT';

const authMiddleware = async (req, res, next) => {
    try {
        // Obtener el token de acceso de las cookies o encabezados
        const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

        if (!accessToken) {
            console.log('401 - No autorizado: Token no proporcionado');
            return res.status(401).json({ message: 'No autorizado: Token no proporcionado' });
            
        }

        // Verificar el token de acceso
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        req.user = decoded; // Almacena la información del usuario en el objeto req

        // Verificar el token CSRF (si se está utilizando)
        const csrfToken = req.cookies.csrfToken;
        if (req.method !== 'GET' && !csrfToken) {
            console.log('403 - Solicitud inválida: Token CSRF faltante');
            return res.status(403).json({ message: 'Solicitud inválida: Token CSRF faltante' });
        }

        // Verificar que el token CSRF coincida con el del servidor
        if (req.method !== 'GET' && csrfToken !== req.session.csrfToken) {
            console.log('403 - Solicitud inválida: Token CSRF no válido');
            return res.status(403).json({ message: 'Solicitud inválida: Token CSRF no válido' });
        }

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
