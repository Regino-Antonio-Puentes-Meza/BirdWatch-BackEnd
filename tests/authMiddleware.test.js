import jwt from 'jsonwebtoken';
import authMiddleware from '../src/middlewares/authMiddleware';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            cookies: {},
            headers: {},
            session: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn(); 
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if no token is provided', async () => {
        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado: Token no proporcionado' });
        expect(next).not.toHaveBeenCalled(); // Asegura que next no se llame
    });

    it('should return 401 if the token is invalid', async () => {
        req.cookies.accessToken = 'invalid_token'; // Simula un token inválido
        jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); }); // Simula un error de verificación

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado: Token inválido' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if the token is expired', async () => {
        req.cookies.accessToken = 'expired_token'; // Simula un token expirado
        jwt.verify.mockImplementation(() => { throw { name: 'TokenExpiredError' }; }); // Simula un error de token expirado

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado: Token expirado' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if CSRF token is missing on non-GET requests', async () => {
        req.cookies.accessToken = 'valid_token'; // Simula un token válido
        req.method = 'POST'; // Simula una solicitud no GET
        jwt.verify.mockReturnValue({ id: 'userId' }); // Simula la decodificación del token

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Solicitud inválida: Token CSRF faltante' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if CSRF token does not match', async () => {
        req.cookies.accessToken = 'valid_token'; // Simula un token válido
        req.cookies.csrfToken = 'wrong_csrf_token'; // Simula un token CSRF incorrecto
        req.method = 'POST'; // Simula una solicitud no GET
        req.session.csrfToken = 'expected_csrf_token'; // Simula el token CSRF esperado
        jwt.verify.mockReturnValue({ id: 'userId' }); // Simula la decodificación del token

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Solicitud inválida: Token CSRF no válido' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if token and CSRF are valid', async () => {
        req.cookies.accessToken = 'valid_token'; // Simula un token válido
        req.cookies.csrfToken = 'valid_csrf_token'; // Simula un token CSRF válido
        req.method = 'POST'; // Simula una solicitud no GET
        req.session.csrfToken = 'valid_csrf_token'; // Simula el token CSRF esperado
        jwt.verify.mockReturnValue({ id: 'userId' }); // Simula la decodificación del token

        await authMiddleware(req, res, next);

        expect(next).toHaveBeenCalled(); // Asegura que next se llame
        expect(req.user).toEqual({ id: 'userId' }); // Verifica que la información del usuario se almacene correctamente en el objeto `req`.
    });
});