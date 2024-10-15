import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import upload from './src/routes/uploadRoute.js';
import newsRoute from './src/routes/newsRoute.js';
import bodyParser from 'body-parser';

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
server.use(bodyParser.json({ limit: '30mb', extended: true }));
server.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

console.log('Rutas listas');

// Rutas de la API
server.use('/api', authRoutes);
server.use('/api', upload);
server.use('/api/news', newsRoute)


// Si no encuentras ninguna ruta, puedes devolver un error 404
server.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});