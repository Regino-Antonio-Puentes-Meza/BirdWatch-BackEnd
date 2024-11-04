import { forgotPassword } from '../src/controllers/forgotPasswordController';
import User from '../src/models/UserModel';
import dbConnect from '../src/config/dbConnect';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../src/utils/emailService';

jest.mock('../src/models/UserModel');
jest.mock('../src/config/dbConnect');
jest.mock('../src/utils/emailService');

describe('Password Controller - Forgot Password', () => {
    let req, res;

    beforeAll(() => {
        // Configuración de variables de entorno para las pruebas
        process.env.JWT_SECRET = 'test_secret';
        process.env.FRONTEND_URL = 'http://localhost:3000';
    });

    beforeEach(() => {
        req = {
            body: {
                correoElectronico: '',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks(); // Limpiar mocks después de cada prueba
    });

    it('should handle database connection errors', async () => {
        const errorMessage = 'Error al conectar a la base de datos';
        dbConnect.mockRejectedValue(new Error(errorMessage)); // Simula un error de conexión

        req.body.correoElectronico = 'juanperez@example.com';

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al intentar recuperar la contraseña' });
    });

    it('should return 400 if user is not found', async () => {
        dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
        User.findOne.mockResolvedValue(null); // Simula que no se encontró el usuario

        req.body.correoElectronico = 'nonexistent@example.com';

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should send recovery email and return 200 if user is found', async () => {
        const testUser = {
            id: '1234567890abcdef12345678',
            correoElectronico: 'juanperez@example.com',
        };

        dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
        User.findOne.mockResolvedValue(testUser); // Simula que se encontró el usuario

        req.body.correoElectronico = 'juanperez@example.com';

        await forgotPassword(req, res);

        const resetToken = jwt.sign(
            { id: testUser.id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        // Verificar que se envió el correo
        expect(sendEmail).toHaveBeenCalledWith(
            testUser.correoElectronico,
            'Recuperación de contraseña',
            expect.stringContaining('Haz clic en el siguiente enlace para restablecer tu contraseña'),
            expect.stringContaining(`<a href="${resetLink}">${resetLink}</a>`)
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Se ha enviado un enlace de recuperación de contraseña a tu correo' });
    });

    it('should return 500 if there is a server error', async () => {
        const testUser = {
            id: '1234567890abcdef12345678',
            correoElectronico: 'juanperez@example.com',
        };

        dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
        User.findOne.mockResolvedValue(testUser); // Simula que se encontró el usuario

        // Simula un error al enviar el correo
        sendEmail.mockRejectedValue(new Error('Error al enviar el correo')); // Cambiado a rejectedValue

        req.body.correoElectronico = 'juanperez@example.com';

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al intentar recuperar la contraseña' });
    });
});
