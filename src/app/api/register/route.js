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

    // Conectar a la base de datos
    await dbConnect();

    // Verificar si el usuario o correo ya existe
    const usuarioExistente = await User.findOne({ $or: [{ correoElectronico }, { usuario }] });
    if (usuarioExistente) {
      return NextResponse.json({ message: 'El correo o usuario ya existe' }, { status: 400 });
    }

    // Encriptar la contraseña
    const encriptContrasena = await bcrypt.hash(contrasena, 10);
    const encriptConfirmContrasena = await bcrypt.hash(confirmContrasena, 10);

    // Crear un nuevo usuario
    const newUser = new User({
      nombre,
      apellidos,
      usuario,
      correoElectronico,
      contrasena: encriptContrasena,
      confirmContrasena: encriptConfirmContrasena,
    });

    await newUser.save();

    // Responder con éxito
    return NextResponse.json({ message: 'Usuario creado exitosamente' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
