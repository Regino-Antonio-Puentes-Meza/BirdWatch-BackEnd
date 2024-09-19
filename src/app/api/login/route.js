<<<<<<< Updated upstream
import dbConnect from '../../libs/dbConnect';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

=======
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// Manejar la solicitud POST para el login
>>>>>>> Stashed changes
export async function POST(req) {
  try {
    // Conectar a la base de datos
    await dbConnect();

<<<<<<< Updated upstream
    const { correoElectronico, contrasena } = await req.json();

    // Verificar si el usuario existe
    const user = await User.findOne({ correoElectronico });
    if (!user) {
      return new Response(JSON.stringify({ message: 'Usuario o contraseña incorrectos' }), {
        status: 400,
      });
=======
    // Obtener los datos de la solicitud
    const { correoElectronico, contrasena } = await req.json();

    // Verificar si el usuario existe en la base de datos
    const user = await User.findOne({ correoElectronico });
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: 'Usuario o contraseña incorrectos' }),
        { status: 400 }
      );
>>>>>>> Stashed changes
    }

    // Comparar la contraseña ingresada con la almacenada en la base de datos
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
<<<<<<< Updated upstream
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
=======
      return new NextResponse(
        JSON.stringify({ message: 'Usuario o contraseña incorrectos' }),
        { status: 400 }
      );
    }

    // Si el login es exitoso, devolver la respuesta
    return new NextResponse(
      JSON.stringify({ message: 'Inicio de sesión exitoso' }),
      {
        status: 200,
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
      { status: 500 }
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
