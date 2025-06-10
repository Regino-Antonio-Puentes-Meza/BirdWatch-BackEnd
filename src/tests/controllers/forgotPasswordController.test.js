import { forgotPassword } from '../../controllers/forgotPasswordController.js';
import User from '../../models/UserModel.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../utils/emailService.js';
import dbConnect from '../../config/dbConnect.js';
import messages from '../../utils/messages.js';

jest.mock('../../models/UserModel.js');
jest.mock('jsonwebtoken');
jest.mock('../../utils/emailService.js');
jest.mock('../../config/dbConnect.js', () => jest.fn());

describe('forgotPasswordController', () => {
    let req, res;

    const mockUser = {
        id: 'user123',
        correoElectronico: 'test@example.com'
    };

    beforeEach(() => {
        req = {
            body: {
                correoElectronico: mockUser.correoElectronico
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('debe devolver 400 si el usuario no existe', async () => {
        User.findOne.mockResolvedValue(null);

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: messages.USER.USER_NOT_FOUND });
    });

    it('debe generar un token y enviar un correo si el usuario existe', async () => {
        process.env.JWT_SECRET = 'secret';
        process.env.FRONTEND_URL = 'http://localhost:3000';

        User.findOne.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('fakeToken');

        await forgotPassword(req, res);

        expect(jwt.sign).toHaveBeenCalledWith(
            { id: mockUser.id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        expect(sendEmail).toHaveBeenCalledWith(
            mockUser.correoElectronico,
            expect.any(String),
            expect.stringContaining('http://localhost:3000/reset-password?token=fakeToken'),
            expect.stringContaining('<a href="http://localhost:3000/reset-password?token=fakeToken">')
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ error: messages.PASSWORD_RESET.PASSWORD_RESET_LINK });
    });

    it('debe manejar errores y devolver 500', async () => {
        User.findOne.mockImplementation(() => {
            throw new Error('DB error');
        });

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: messages.PASSWORD_RESET.PASSWORD_RECOVERY_ERROR });
    });
});
