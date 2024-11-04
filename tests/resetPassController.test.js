import { resetPassword } from '../src/controllers/resetPasswordController'; // Ajusta la ruta si es necesario
import User from '../src/models/UserModel'; // Asegúrate de que la ruta sea correcta
import dbConnect from '../src/config/dbConnect'; // Asegúrate de que la ruta sea correcta
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/UserModel');
jest.mock('../src/config/dbConnect');

describe('Password Controller - Reset Password', () => {
    let req, res;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test_secret'; // Asegúrate de que esta variable esté configurada
    });

    beforeEach(() => {
        req = {
            body: {
                token: '',
                nuevaContrasena: '',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if token is expired', async () => {
        const expiredToken = jwt.sign({ id: '1234567890abcdef12345678' }, process.env.JWT_SECRET, { expiresIn: '-1s' });

        req.body.token = expiredToken;
        req.body.nuevaContrasena = 'nuevaContrasena123';

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'El token ha expirado' });
    });

    it('should return 400 if user is not found', async () => {
        const validToken = jwt.sign({ id: '1234567890abcdef12345678' }, process.env.JWT_SECRET);

        req.body.token = validToken;
        req.body.nuevaContrasena = 'nuevaContrasena123';

        dbConnect.mockResolvedValue();
        User.findById.mockResolvedValue(null); // Simula que no se encontró el usuario

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should update the password and return 200 if user is found', async () => {
        const testUser = {
            id: '1234567890abcdef12345678',
            contrasena: 'oldPassword123',
            save: jest.fn(), // Mock save function
        };

        const validToken = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET);

        req.body.token = validToken;
        req.body.nuevaContrasena = 'nuevaContrasena123';

        dbConnect.mockResolvedValue();
        User.findById.mockResolvedValue(testUser); // Simula que se encontró el usuario

        await resetPassword(req, res);

        // Verifica que la contraseña haya sido actualizada
        expect(testUser.save).toHaveBeenCalled();
        const isPasswordMatch = await bcrypt.compare(req.body.nuevaContrasena, testUser.contrasena);
        expect(isPasswordMatch).toBe(true); // La nueva contraseña debe coincidir con la contraseña encriptada

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Contraseña restablecida exitosamente' });
    });

    it('should return 500 if there is a server error', async () => {
        const validToken = jwt.sign({ id: '1234567890abcdef12345678' }, process.env.JWT_SECRET);

        req.body.token = validToken;
        req.body.nuevaContrasena = 'nuevaContrasena123';

        dbConnect.mockResolvedValue();
        User.findById.mockResolvedValue({ id: '1234567890abcdef12345678' }); // Simula que se encontró el usuario

        // Simula un error en el método save
        User.prototype.save.mockRejectedValue(new Error('Error en el guardado'));

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al restablecer la contraseña' });
    });
});
