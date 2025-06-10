import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import authRoutes from './src/routes/authRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import newsRoutes from './src/routes/newsRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import birdRoutes from './src/routes/birdsRoutes.js';
import departmentRoutes from './src/routes/location/departmentRoutes.js';
import municipalityRoutes from './src/routes/location/municipalityRoutes.js';
import authMiddleware from './src/middlewares/authMiddleware.js';
import dbConnect from './src/config/dbConnect.js';

dotenv.config();

const app = express();

// Configuración de CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization');
  next();
});

// Middleware para manejo de JSON y datos codificados
app.use(express.json());
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

// Middleware para registrar las solicitudes
app.use((req, res, next) => {
  console.info(`Solicitud ${req.method} en la ruta ${req.originalUrl}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);
app.use('/api/news', authMiddleware, newsRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/birds', birdRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/municipalities', municipalityRoutes);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar el servidor solo si no está en entorno de pruebas
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;

  dbConnect().then(() => {
    console.log('Conexión a la base de datos establecida');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  }).catch((error) => {
    console.error('Error al conectar la base de datos:', error.message);
  });
}

export default app;