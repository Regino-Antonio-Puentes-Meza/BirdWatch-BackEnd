import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { createCORSResponse, handleCORSOptions } from '../../../utils/cors';
import { registerSchema } from '../../../validation/registerSchema';

export async function POST(req) {
  try {
    const body = await req.json(); // Obtener datos del cuerpo

    // Validar datos
    await registerSchema.validate(body);

    const { nombre, apellidos, usuario, correoElectronico, contrasena } = body;

    await dbConnect(); // Conectar a la base de datos

    const userExists = await User.findOne({ $or: [{ correoElectronico }, { usuario }] }); // Verificar existencia
    if (userExists) {
      let message = userExists.correoElectronico === correoElectronico
        ? 'El correo ya está registrado'
        : 'El usuario ya está registrado';
      return createCORSResponse({ message }, 400);
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10); // Encriptar contraseña

    const newUser = new User({ // Crear nuevo usuario
      nombre,
      apellidos,
      usuario,
      correoElectronico,
      contrasena: hashedPassword,
    });

    await newUser.save(); // Guardar en la base de datos

    return createCORSResponse({ message: 'Usuario creado exitosamente' }, 201); // Responder con éxito
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createCORSResponse({ error: error.message }, 400); // Manejo de error de validación
    }
    return createCORSResponse({ error: error.message }, 500); // Otros errores
  }
}

export async function OPTIONS() {
  return handleCORSOptions(); // Manejar CORS para OPTIONS
}
