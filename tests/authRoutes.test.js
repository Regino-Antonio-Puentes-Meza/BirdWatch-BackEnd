import express from 'express';
import request from 'supertest';
import router from '../src/routes/authRoutes'; // Ajusta la ruta según tu estructura de archivos
// Mockear los controladores
jest.mock('../src/controllers/loginController', () => ({
    login: jest.fn((req, res) => res.status(200).json({ message: 'Login exitoso' })),
    register: jest.fn((req, res) => res.status(201).json({ message: 'Registro exitoso' })),
}));

jest.mock('../src/controllers/forgotPasswordController', () => ({
    forgotPassword: jest.fn((req, res) => res.status(200).json({ message: 'Enlace de recuperación enviado' })),
}));

jest.mock('../src/controllers/resetPasswordController', () => ({
    resetPassword: jest.fn((req, res) => res.status(200).json({ message: 'Contraseña restablecida' })),
}));

const app = express();
app.use(express.json());
app.use('/api', router); // Usa el enrutador que has creado

describe('API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should login successfully', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'testpass' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login exitoso');
    });

    it('should register successfully', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({ username: 'testuser', password: 'testpass' });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Registro exitoso');
    });

    it('should send forgot password link', async () => {
        const response = await request(app)
            .post('/api/forgot-password')
            .send({ email: 'test@example.com' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Enlace de recuperación enviado');
    });

    it('should reset password', async () => {
        const response = await request(app)
            .post('/api/reset-password')
            .send({ token: 'valid-token', newPassword: 'newpassword' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Contraseña restablecida');
    });
});