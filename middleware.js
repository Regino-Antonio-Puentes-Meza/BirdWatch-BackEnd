import { NextResponse } from 'next/server';
import Cors from 'cors';

// Configura el middleware de CORS
const cors = Cors({
    origin: 'http://localhost:5173', // Permitir solicitudes desde este origen
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

// Middleware para manejar CORS
export function middleware(req) {
    return new Promise((resolve) => {
        cors(req, null, (result) => {
            resolve(NextResponse.next());
        });
    });
}

// Configuración del middleware
export const config = {
    matcher: '/api/:path*',  // Aplica el middleware a todas las rutas de la API
};
