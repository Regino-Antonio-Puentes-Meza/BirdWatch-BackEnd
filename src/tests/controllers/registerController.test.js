import { register } from '../../controllers/registerController.js';
import User from '../../models/UserModel.js';

jest.mock('../../models/UserModel.js');
jest.mock('../../config/dbConnect.js', () => jest.fn());

describe('registerController', () => {
  it('debe registrar un usuario correctamente', async () => {
    const req = {
      body: {
        nombre: 'Juan',
        apellidos: 'Pérez',
        usuario: 'juan123',
        isOrnitologo: false,
        correoElectronico: 'juan@example.com',
        contrasena: 'password123',
        confirmarContrasena: 'password123'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Simula que no existe el usuario
    User.findOne.mockResolvedValue(null);

    // Simula la instancia de User y su método save
    User.mockImplementation(() => ({
      _id: 'mockId',
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      usuario: req.body.usuario,
      correoElectronico: req.body.correoElectronico,
      contrasena: 'hashedPassword',
      save: jest.fn().mockResolvedValue(true)
    }));

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Usuario creado exitosamente',
      token: expect.any(String),
      user: expect.objectContaining({
        nombre: 'Juan',
        correoElectronico: 'juan@example.com'
      })
    }));
  });

  it('debe devolver error si el usuario ya está registrado', async () => {
    const req = {
      body: {
        nombre: 'Juan',
        apellidos: 'Pérez',
        usuario: 'juan123',
        isOrnitologo: false,
        correoElectronico: 'juan@example.com',
        contrasena: 'password123',
        confirmarContrasena: 'password123'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Simula que ya existe un usuario con ese correo
    User.findOne.mockResolvedValue({
      correoElectronico: 'juan@example.com'
    });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.any(String)
    });
  });

  it('debe devolver error de validación si faltan campos requeridos', async () => {
    const req = {
      body: {
        nombre: '', // inválido para Yup
        correoElectronico: 'no-email',
        contrasena: '123',
        confirmarContrasena: '123'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.any(String)
    });
  });
});