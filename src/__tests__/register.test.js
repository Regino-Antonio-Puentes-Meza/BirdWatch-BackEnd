import { NextRequest } from 'next/server';
import { POST, OPTIONS } from '../app/api/register/route';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { registerSchema } from '../validation/registerSchema';

jest.mock('../lib/dbConnect');
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('../validation/registerSchema');

describe('POST /api/register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully create a new user', async () => {
        const mockUser = {
            nombre: 'Roy',
            apellidos: 'MR',
            usuario: 'roys99',
            correoElectronico: 'Roy@example.com',
            contrasena: 'password123'
        };

        registerSchema.validate.mockResolvedValue(mockUser);
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashedPassword');
        User.prototype.save.mockResolvedValue(mockUser);

        const req = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify(mockUser),
        });

        const response = await POST(req);
        const responseBody = await response.json();

        expect(response.status).toBe(201);
        expect(responseBody.message).toBe('Usuario creado exitosamente');
    });

    it('should return 400 if the mail is already registered', async () => {
        const mockUser = {
            nombre: 'Roy',
            apellidos: 'MR',
            usuario: 'roys99',
            correoElectronico: 'Roy@example.com',
            contrasena: 'password123'
        };

        registerSchema.validate.mockResolvedValue(mockUser);
        User.findOne.mockResolvedValue({ correoElectronico: 'Roy@example.com' });

        const req = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify(mockUser),
        });

        const response = await POST(req);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody.message).toBe('El correo ya está registrado');
    });
    it('should return 400 if the user is already registered', async () => {
        const mockUser = {
            nombre: 'Roy',
            apellidos: 'MR',
            usuario: 'roys99',
            correoElectronico: 'Roy@example.com',
            contrasena: 'password123'
        };

        registerSchema.validate.mockResolvedValue(mockUser);
        User.findOne.mockResolvedValue({ usuario: 'roys99' });

        const req = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify(mockUser),
        });

        const response = await POST(req);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody.message).toBe('El usuario ya está registrado');
    });

    it('should return 400 if the registration data is invalid', async () => {
        const mockUser = {
            nombre: 'Roy',
            apellidos: 'MR',
            usuario: 'roys99',
            correoElectronico: 'invalid-email',
            contrasena: 'short'
        };

        registerSchema.validate.mockRejectedValue({ name: 'ValidationError', message: 'Datos de registro inválidos' });

        const req = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify(mockUser),
        });

        const response = await POST(req);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody.error).toBe('Datos de registro inválidos');
    });

    it('should handle server errors', async () => {
        const mockUser = {
            nombre: 'Roy',
            apellidos: 'MR',
            usuario: 'roys99',
            correoElectronico: 'Roy@example.com',
            contrasena: 'password123'
        };

        registerSchema.validate.mockResolvedValue(mockUser);
        User.findOne.mockRejectedValue(new Error('Error de base de datos'));

        const req = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify(mockUser),
        });

        const response = await POST(req);
        const responseBody = await response.json();

        expect(response.status).toBe(500);
        expect(responseBody.error).toBe('Error de base de datos');
    });

    it('should correctly handle OPTIONS requests', async () => {
        const req = new NextRequest('http://localhost:3000/api/register', {
            method: 'OPTIONS',
        });

        const response = await OPTIONS(req);

        expect(response.status).toBe(200);
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
        expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
        expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Origin, Content-Type, Authorization');
        expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
        expect(response.headers.get('Content-Type')).toBe('application/json');
    });
});
