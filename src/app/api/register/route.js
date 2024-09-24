import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { createCORSResponse, handleCORSOptions } from '../../../utils/cors';
import { registerSchema } from '../../../validation/registerSchema';

export async function POST(req) {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const body = await req.json();

    // Validar los datos utilizando el esquema de validación
    await registerSchema.validate(body);

    const { nombre, apellidos, usuario, correoElectronico, contrasena } = body;

    // Conectar a la base de datos
    await dbConnect();

    // Verificar si el usuario o el correo ya existe
    const userExists = await User.findOne({ $or: [{ correoElectronico }, { usuario }] });
    if (userExists) {
      let message = userExists.correoElectronico === correoElectronico
        ? 'El correo ya está registrado'
        : 'El usuario ya está registrado';
      return createCORSResponse({ message }, 400);
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear un nuevo usuario
    const newUser = new User({
      nombre,
      apellidos,
      usuario,
      correoElectronico,
      contrasena: hashedPassword,
    });

    await newUser.save();

    // Responder con éxito
    return createCORSResponse({ message: 'Usuario creado exitosamente' }, 201);
  } catch (error) {
    // Si es un error de validación (Yup), devolver un error 400
    if (error.name === 'ValidationError') {
      return createCORSResponse({ error: error.message }, 400);
    }

    // Otros errores
    return createCORSResponse({ error: error.message }, 500);
  }
}

// Manejar las solicitudes OPTIONS para CORS
export async function OPTIONS() {
  return handleCORSOptions();
}