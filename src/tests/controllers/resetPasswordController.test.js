import { resetPassword } from '../../controllers/resetPasswordController.js';
import User from '../../models/UserModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import messages from '../../utils/messages.js';
import dbConnect from '../../config/dbConnect.js';

jest.mock('../../models/UserModel.js');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('../../config/dbConnect.js', () => jest.fn());

describe('resetPasswordController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                token: 'valid-token',
                nuevaContrasena: 'newpassword123'
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('debe restablecer la contraseña correctamente', async () => {
        const fakeUser = { 
            _id: '123abc',
            save: jest.fn()
        };

        jwt.verify.mockReturnValue({ id: '123abc' });
        User.findById.mockResolvedValue(fakeUser);
        bcrypt.hash.mockResolvedValue('hashedPassword');

        await resetPassword(req, res);

        expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
        expect(User.findById).toHaveBeenCalledWith('123abc');
        expect(fakeUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ error: messages.PASSWORD_RESET.PASSWORD_RESET });
    });

    it('debe devolver error si el token expiró', async () => {
        jwt.verify.mockImplementation(() => {
            const err = new Error();
            err.name = 'TokenExpiredError';
            throw err;
        });

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: messages.AUTH.TOKEN_EXPIRED });
    });

    it('debe devolver error si el usuario no existe', async () => {
        jwt.verify.mockReturnValue({ id: '123abc' });
        User.findById.mockResolvedValue(null);

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: messages.USER.USER_NOT_FOUND });
    });

    it('debe devolver error 500 si ocurre una excepción', async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error('Otro error');
        });

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: messages.PASSWORD_RESET.PASSWORD_RESET_ERROR });
    });
});
