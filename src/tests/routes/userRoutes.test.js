import request from 'supertest';
jest.mock('../../config/dbConnect.js', () => jest.fn(() => Promise.resolve()));
import app from '../../../app.js';
import User from '../../models/UserModel.js';

jest.mock('../../models/UserModel.js');

describe('POST /api/register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería devolver 201 cuando el registro es exitoso', async () => {
        User.findOne.mockResolvedValue(null);
        User.prototype.save = jest.fn().mockResolvedValue({ _id: '1', correoElectronico: 'test@example.com' });

        const res = await request(app)
            .post('/api/register')
            .send({
                nombre: 'Juan',
                apellidos: 'Pérez',
                usuario: 'juan123',
                correoElectronico: 'juan@example.com',
                contrasena: '12345678',
                isOrnitologo: true
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Usuario creado exitosamente');
        expect(res.body).toHaveProperty('token');
    });

    it('debería devolver 400 si el correo ya está registrado', async () => {
        User.findOne.mockResolvedValue({ correoElectronico: 'juan@example.com' });

        const res = await request(app)
            .post('/api/register')
            .send({
                nombre: 'Juan',
                apellidos: 'Pérez',
                usuario: 'juan123',
                correoElectronico: 'juan@example.com',
                contrasena: '12345678',
                isOrnitologo: true
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'El correo ya está registrado');
    });

    it('debería devolver 400 si los datos no pasan la validación', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                nombre: '',
                correoElectronico: 'correoInvalido',
                contrasena: '123',
                isOrnitologo: true
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error'); // mensaje de validación
    });

    it('debería devolver 500 si ocurre un error inesperado', async () => {
        User.findOne.mockRejectedValue(new Error('DB error'));

        const res = await request(app)
            .post('/api/register')
            .send({
                nombre: 'Juan',
                apellidos: 'Pérez',
                usuario: 'juan123',
                correoElectronico: 'juan@example.com',
                contrasena: '12345678',
                isOrnitologo: true
            });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error', 'DB error');
    });
});
