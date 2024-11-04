import { login } from '../src/controllers/loginController';
import User from '../src/models/UserModel';
import bcrypt from 'bcryptjs';
import dbConnect from '../src/config/dbConnect';

jest.mock('../src/models/UserModel');
jest.mock('../src/config/dbConnect');

describe('Auth Controller - Login', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
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
        correoElectronico: 'juanperez@example.com',
        contrasena: await bcrypt.hash('password123', 10),
    });

    it('should handle database connection errors', async () => {
        const errorMessage = 'Error al conectar a la base de datos';
        dbConnect.mockRejectedValue(new Error(errorMessage)); // Simula un error de conexión

        req.body.correoElectronico = 'juanperez@example.com';
        req.body.contrasena = 'password123';

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });

    it('should handle user search errors', async () => {
        dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
        User.findOne.mockImplementation(() => {
            throw new Error('Error en la búsqueda del usuario');
        });

        req.body.correoElectronico = 'juanperez@example.com';
        req.body.contrasena = 'password123';

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al buscar el usuario' });
    });

    it('should login successfully with valid credentials', async () => {
        const testUser = await createTestUser();

        User.findOne.mockResolvedValue(testUser); // Simula que se encontró el usuario

        req.body.correoElectronico = 'juanperez@example.com';
        req.body.contrasena = 'password123';

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Inicio de sesión exitoso',
            token: expect.any(String), // Verifica que se devuelva un token
            user: {
                nombre: testUser.nombre,
                apellidos: testUser.apellidos,
                usuario: testUser.usuario,
                correoElectronico: testUser.correoElectronico,
            },
        });
    });

    it('should return 400 for invalid credentials (user not found)', async () => {
        dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
        User.findOne.mockResolvedValue(null); // Simula que no se encontró el usuario

        req.body.correoElectronico = 'invalid@example.com';
        req.body.contrasena = 'wrongpassword';

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario o contraseña incorrectos' });
    });

    it('should return 400 for invalid credentials (incorrect password)', async () => {
        const testUser = await createTestUser();

        User.findOne.mockResolvedValue(testUser); // Simula que se encontró el usuario

        req.body.correoElectronico = 'juanperez@example.com';
        req.body.contrasena = 'wrongpassword'; // Contraseña incorrecta

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario o contraseña incorrectos' });
    });

    it('should return 500 if there is a server error', async () => {
        User.findOne.mockImplementationOnce(() => {
            throw new Error('Error en la base de datos'); // Simula un error en la búsqueda
        });

        req.body.correoElectronico = 'juanperez@example.com';
        req.body.contrasena = 'password123';

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error en la base de datos' });
    });
});
