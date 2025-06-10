import { login } from '../../controllers/loginController.js';
import User from '../../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import messages from '../../utils/messages.js';

jest.mock('../../models/UserModel.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../config/dbConnect.js', () => jest.fn());

describe('loginController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                correoElectronico: 'test@example.com',
                contrasena: 'password123'
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('debe autenticar al usuario correctamente', async () => {
        const fakeUser = {
            _id: '123abc',
            nombre: 'Juan',
            apellidos: 'Pérez',
            usuario: 'juanito',
            correoElectronico: 'test@example.com',
            contrasena: 'hashedPass'
        };

        User.findOne.mockResolvedValue(fakeUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('mocked-jwt-token');

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: messages.AUTH.LOGIN_SUCCESS,
            token: 'mocked-jwt-token',
            user: {
                nombre: fakeUser.nombre,
                apellidos: fakeUser.apellidos,
                usuario: fakeUser.usuario,
                correoElectronico: fakeUser.correoElectronico
            }
        });
    });

    it('debe retornar error si el usuario no existe', async () => {
        User.findOne.mockResolvedValue(null);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: messages.AUTH.INVALID_CREDENTIALS
        });
    });

    it('debe retornar error si la contraseña es incorrecta', async () => {
        const fakeUser = {
            correoElectronico: 'test@example.com',
            contrasena: 'hashedPass'
        };

        User.findOne.mockResolvedValue(fakeUser);
        bcrypt.compare.mockResolvedValue(false);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: messages.AUTH.INVALID_CREDENTIALS
        });
    });

    it('debe retornar error 500 si ocurre un error inesperado', async () => {
        User.findOne.mockRejectedValue(new Error('DB error'));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: messages.SERVER.INTERNAL_SERVER_ERROR
        });
    });
});
