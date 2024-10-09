import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';

dotenv.config();

console.log('Archivo server.js ejecutado');

const server = express();

// Configuración de CORS
server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization');
    next();
});

// Middleware para manejo de JSON
server.use(express.json());

console.log('Rutas listas');

// Rutas de la API
server.use('/api', authRoutes);


// Si no encuentras ninguna ruta, puedes devolver un error 404
server.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
