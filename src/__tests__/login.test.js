import { NextRequest } from 'next/server';
import { POST, OPTIONS } from '../app/api/login/route';
import dbConnect from '../lib/dbConnect';
import User from '../models/User';
import bcrypt from 'bcryptjs';

jest.mock('../lib/dbConnect');
jest.mock('../models/User');
jest.mock('bcryptjs');

describe('POST /api/login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if the user does not exist', async () => {
        User.findOne.mockResolvedValue(null);

        const req = new NextRequest('http://localhost:3000/api/login', {
            method: 'POST',
            body: JSON.stringify({ correoElectronico: 'test@example.com', contrasena: 'password123' }),
        });

        const response = await POST(req);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody.message).toBe('Usuario o contraseña incorrectos');
    });

    it('should return 400 if the password is incorrect', async () => {
        User.findOne.mockResolvedValue({ contrasena: 'hashedPassword' });
        bcrypt.compare.mockResolvedValue(false);

        const req = new NextRequest('http://localhost:3000/api/login', {
            method: 'POST',
            body: JSON.stringify({ correoElectronico: 'test@example.com', contrasena: 'wrongpassword' }),
        });

        const response = await POST(req);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody.message).toBe('Usuario o contraseña incorrectos');
    });

    it('should return 200 if the login succeeds', async () => {
        User.findOne.mockResolvedValue({ contrasena: 'hashedPassword' });
        bcrypt.compare.mockResolvedValue(true);

        const req = new NextRequest('http://localhost:3000/api/login', {
            method: 'POST',
            body: JSON.stringify({ correoElectronico: 'test@example.com', contrasena: 'password123' }),
        });

        const response = await POST(req);
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(responseBody.message).toBe('Inicio de sesión exitoso');
    });

    it('should handle server errors', async () => {
        User.findOne.mockRejectedValue(new Error('Error del servidor'));

        const req = new NextRequest('http://localhost:3000/api/login', {
            method: 'POST',
            body: JSON.stringify({ correoElectronico: 'test@example.com', contrasena: 'password123' }),
        });

        const response = await POST(req);
        const responseBody = await response.json();

        expect(response.status).toBe(500);
        expect(responseBody.error).toBe('Error del servidor');
    });

    it('should correctly handle OPTIONS requests', async () => {
        const req = new NextRequest('http://localhost:3000/api/login', {
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