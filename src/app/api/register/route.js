<<<<<<< Updated upstream
import { NextResponse } from 'next/server';
import dbConnect from '@/app/libs/dbConnect';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/app/validation/registerSchema';

export async function POST(req) {
  try {
    const body = await req.json();

    // Validar los datos
    await registerSchema.validate(body);
    
    const { nombre, apellidos, usuario, correoElectronico, contrasena, confirmContrasena } = body;
=======
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { registerSchema } from '../../../validation/registerSchema';

export async function POST(req) {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const body = await req.json();

    // Validar los datos utilizando el esquema de validación
    await registerSchema.validate(body);

    const { nombre, apellidos, usuario, correoElectronico, contrasena } = body;
>>>>>>> Stashed changes

    // Conectar a la base de datos
    await dbConnect();

<<<<<<< Updated upstream
    // Verificar si el usuario o correo ya existe
    const usuarioExistente = await User.findOne({ $or: [{ correoElectronico }, { usuario }] });
    if (usuarioExistente) {
      return NextResponse.json({ message: 'El correo o usuario ya existe' }, { status: 400 });
    }

    // Encriptar la contraseña
    const encriptContrasena = await bcrypt.hash(contrasena, 10);
    const encriptConfirmContrasena = await bcrypt.hash(confirmContrasena, 10);
=======
    // Verificar si el usuario o el correo ya existe
    const userExists = await User.findOne({ $or: [{ correoElectronico }, { usuario }] });
    if (userExists) {
      return new NextResponse(
        JSON.stringify({ message: 'El correo o usuario ya existe' }),
        {
          status: 400
        }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);
>>>>>>> Stashed changes

    // Crear un nuevo usuario
    const newUser = new User({
      nombre,
      apellidos,
      usuario,
      correoElectronico,
<<<<<<< Updated upstream
      contrasena: encriptContrasena,
      confirmContrasena: encriptConfirmContrasena,
=======
      contrasena: hashedPassword,
>>>>>>> Stashed changes
    });

    await newUser.save();

    // Responder con éxito
<<<<<<< Updated upstream
    return NextResponse.json({ message: 'Usuario creado exitosamente' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
=======
    return new NextResponse(
      JSON.stringify({ message: 'Usuario creado exitosamente' }),
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:5173',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Origin, Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      {
        status: 400
      }
    );
  }
}

// Manejar las solicitudes OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
>>>>>>> Stashed changes
