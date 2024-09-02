import dbConnect from '../../libs/dbConnect';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    // Conectar a la base de datos
    await dbConnect();

    const { correoElectronico, contrasena } = await req.json();

    // Verificar si el usuario existe
    const user = await User.findOne({ correoElectronico });
    if (!user) {
      return new Response(JSON.stringify({ message: 'Usuario o contraseña incorrectos' }), {
        status: 400,
      });
    }

    // Comparar la contraseña ingresada con la almacenada en la base de datos
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return new Response(JSON.stringify({ message: 'Usuario o contraseña incorrectos' }), {
        status: 400,
      });
    }

    // Si todo está bien, puedes devolver una respuesta exitosa
    return new Response(JSON.stringify({ message: 'Inicio de sesión exitoso' }), {
      status: 201,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
