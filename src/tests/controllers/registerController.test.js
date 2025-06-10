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
        correoElectronico: 'juan@example.com',
        contraseña: 'password123',
        confirmarContraseña: 'password123' // NECESARIO para que pase la validación
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findOne.mockResolvedValue(null); // Simula que no existe el usuario
    User.create.mockResolvedValue({
      _id: 'mockId',
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      usuario: req.body.usuario,
      correoElectronico: req.body.correoElectronico,
      contraseña: 'hashedPassword'
    });

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
});
