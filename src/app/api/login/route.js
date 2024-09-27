import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { createCORSResponse, handleCORSOptions } from '../../../utils/cors';

export async function POST(req) {
  try {
    await dbConnect(); // Conectar a la base de datos 

    const { correoElectronico, contrasena } = await req.json(); // Obtener datos

    // Verificar si el usuario existe
    const user = await User.findOne({ correoElectronico });
    if (!user) {
      return createCORSResponse({ message: 'Usuario o contraseña incorrectos' }, 400);
    }

    // Comparar las contraseñas
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return createCORSResponse({ message: 'Usuario o contraseña incorrectos' }, 400);
    }

    // Respuesta en caso de inicio de sesión exitoso
    return createCORSResponse({ message: 'Inicio de sesión exitoso' }, 200);
  } catch (error) {
    // Manejo de errores
    return createCORSResponse({ error: error.message }, 500);
  }
}

export async function OPTIONS() {
  return handleCORSOptions(); // Manejar CORS para OPTIONS
}
