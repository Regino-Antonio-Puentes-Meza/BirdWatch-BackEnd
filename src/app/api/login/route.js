import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { createCORSResponse, handleCORSOptions } from '../../../utils/cors';

// Manejar la solicitud POST para el login
export async function POST(req) {
  try {
    // Conectar a la base de datos
    await dbConnect();

    // Obtener los datos de la solicitud
    const { correoElectronico, contrasena } = await req.json();

    // Verificar si el usuario existe en la base de datos
    const user = await User.findOne({ correoElectronico });
    if (!user) {
      return createCORSResponse({ message: 'Usuario o contraseña incorrectos' }, 400);
    }

    // Comparar la contraseña ingresada con la almacenada en la base de datos
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return createCORSResponse({ message: 'Usuario o contraseña incorrectos' }, 400);
    }

    // Si el login es exitoso, devolver la respuesta
    return createCORSResponse({ message: 'Inicio de sesión exitoso' }, 200);
  } catch (error) {
    return createCORSResponse({ error: error.message }, 500);
  }
}

// Manejar las solicitudes OPTIONS para CORS
export async function OPTIONS() {
  return handleCORSOptions();
}