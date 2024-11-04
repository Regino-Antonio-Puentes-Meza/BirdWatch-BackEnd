import { register } from '../src/controllers/registerController';
import User from '../src/models/UserModel';
import bcrypt from 'bcryptjs';
import dbConnect from '../src/config/dbConnect';
import { registerSchema } from '../src/validation/registerSchema';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/UserModel');
jest.mock('../src/config/dbConnect');
jest.mock('jsonwebtoken');

describe('Auth Controller - Register', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                nombre: '',
                apellidos: '',
                usuario: '',
                isOrnitologo: false,
                correoElectronico: '',
                contrasena: '',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    const createTestUser = async () => ({
        _id: '1234567890abcdef12345678',
        nombre: 'Juan',
        apellidos: 'Pérez',
        usuario: 'juanperez',
        isOrnitologo: false,
        correoElectronico: 'juanperez@example.com',
        contrasena: await bcrypt.hash('password123', 10),
    });

    it('should handle database connection errors', async () => {
        const errorMessage = 'Error al conectar a la base de datos';
        dbConnect.mockRejectedValue(new Error(errorMessage)); // Simula un error de conexión

        req.body = {
            nombre: 'Juan',
            apellidos: 'Pérez',
            usuario: 'juanperez',
            isOrnitologo: false,
            correoElectronico: 'juanperez@example.com',
            contrasena: 'password123',
        };

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });

    it('should return 400 for validation errors', async () => {
        const errorMessage = 'Email no válido';
        registerSchema.validate = jest.fn().mockRejectedValue(new Error(errorMessage)); // Simula un error de validación

        req.body = {
            nombre: 'Juan',
            apellidos: 'Pérez',
            usuario: 'juanperez',
            isOrnitologo: false,
            correoElectronico: 'invalid-email',
            contrasena: 'password123',
        };

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });

    it('should return 400 if the user already exists', async () => {
        const existingUser = await createTestUser();
        User.findOne.mockResolvedValue(existingUser); // Simula que el usuario ya existe

        req.body = {
            nombre: 'Juan',
            apellidos: 'Pérez',
            usuario: 'juanperez',
            isOrnitologo: false,
            correoElectronico: 'juanperez@example.com',
            contrasena: 'password123',
        };

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'El correo ya está registrado' });
    });

    it('should register successfully with valid data', async () => {
        User.findOne.mockResolvedValue(null); // Simula que no se encontró el usuario

        const hashedPassword = await bcrypt.hash('password123', 10);
        User.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(true),
            _id: '1234567890abcdef12345678',
            nombre: 'Juan',
            apellidos: 'Pérez',
            usuario: 'juanperez',
            isOrnitologo: false,
            correoElectronico: 'juanperez@example.com',
            contrasena: hashedPassword,
        }));

        const newUser = new User();
        jest.spyOn(newUser, 'save').mockResolvedValue(newUser); // Simula que se guarda el usuario

        jwt.sign.mockReturnValue('token'); // Simula la generación de un token

        req.body = {
            nombre: 'Juan',
            apellidos: 'Pérez',
            usuario: 'juanperez',
            isOrnitologo: false,
            correoElectronico: 'juanperez@example.com',
            contrasena: 'password123',
        };

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Usuario creado exitosamente',
            token: 'token', // Verifica que se devuelva un token
            user: {
                nombre: 'Juan',
                apellidos: 'Pérez',
                usuario: 'juanperez',
                correoElectronico: 'juanperez@example.com',
            },
        });
    });

    it('should return 500 if there is a server error', async () => {
        User.findOne.mockImplementationOnce(() => {
            throw new Error('Error en la base de datos'); // Simula un error en la búsqueda
        });

        req.body = {
            nombre: 'Juan',
            apellidos: 'Pérez',
            usuario: 'juanperez',
            isOrnitologo: false,
            correoElectronico: 'juanperez@example.com',
            contrasena: 'password123',
        };

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error en la base de datos' });
    });
});
