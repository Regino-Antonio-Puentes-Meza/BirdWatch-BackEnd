import authMiddleware from '../../middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();

        jest.clearAllMocks();
    });

    it('debe retornar 401 si no se proporciona el token', () => {
        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado: Token no proporcionado' });
    });

    it('debe retornar 401 si el token está expirado', () => {
        req.headers.authorization = 'Bearer expiredToken';
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';

        jwt.verify.mockImplementation(() => {
            throw error;
        });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado: Token expirado' });
    });

    it('debe retornar 401 si el token es inválido', () => {
        req.headers.authorization = 'Bearer invalidToken';

        const error = new Error('invalid token');
        error.name = 'JsonWebTokenError';

        jwt.verify.mockImplementation(() => {
            throw error;
        });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado: Token inválido' });
    });

    it('debe permitir el acceso si el token es válido', () => {
        req.headers.authorization = 'Bearer validToken';

        const decodedUser = { id: 'user123' };
        jwt.verify.mockReturnValue(decodedUser);

        authMiddleware(req, res, next);

        expect(req.user).toEqual(decodedUser);
        expect(next).toHaveBeenCalled();
    });
});