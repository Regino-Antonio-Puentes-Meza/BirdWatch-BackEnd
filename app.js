import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import authRoutes from './src/routes/authRoutes.js';
import uploadRoutes from './src/routes/uploadRoute.js';
import newsRoutes from './src/routes/newsRoute.js';
import postRoutes from './src/routes/postRoute.js';
import userRoutes from './src/routes/userRoutes.js';
import birdRoutes from './src/routes/birdsRoutes.js';
import departmentRoutes from './src/routes/location/departmentRoutes.js';
import municipalityRoutes from './src/routes/location/municipalityRoutes.js';
import dbConnect from './src/lib/dbConnect.js';
import authMiddleware from './src/middleware/authMiddleware.js';


dotenv.config();
dbConnect();
console.log('Conexión a la base de datos establecida');

const server = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization');
    next();
});

// Middleware para manejo de JSON y datos codificados
server.use(express.json());
server.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

// Rutas de la API
server.use('/api/auth', authRoutes);
server.use('/api/upload',authMiddleware, uploadRoutes);
server.use('/api/news', authMiddleware, newsRoutes);
server.use('/api/posts',authMiddleware, postRoutes);
server.use('/api/user', userRoutes);
server.use('/api/birds', birdRoutes);
server.use('/api/departments', departmentRoutes);
server.use('/api/municipalities', municipalityRoutes);

// Ruta 404 para rutas no encontradas
server.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


dotenv.config();



server.use(bodyParser.json({ limit: '30mb', extended: true }));
server.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
