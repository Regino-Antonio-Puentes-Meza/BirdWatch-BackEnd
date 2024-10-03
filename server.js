// server.js
import express from 'express';
import next from 'next';
import authRoutes from './src/routes/authRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Archivo server.js ejecutado');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    console.log('Servidor iniciado');
    // Configuración de CORS
    server.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization');
        next();
    });

    server.use(express.json());

    console.log('Rutas listas');

    // Rutas de la API
    server.use('/api', authRoutes);

    // Manejo de las demás rutas por Next.js
    server.all('*', (req, res) => {
        console.log('Ruta no encontrada');
        return handle(req, res);
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});