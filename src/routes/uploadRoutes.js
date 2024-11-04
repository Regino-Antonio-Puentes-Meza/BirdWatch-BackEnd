import express from 'express';
import uploadToAzure from '../middlewares/upload.js';
const router = express.Router();

// Middleware para registrar las solicitudes
router.use((req, res, next) => {
    console.log(`Solicitud ${req.method} en la ruta ${req.originalUrl}`);
    next();
});

router.post('/upFile', uploadToAzure, (req, res) => {
    if (req.body.imageUrl) {
        res.status(200).json({ message: 'Imagen subida correctamente', url: req.file.url });
    } else {
        res.status(400).json({ error: 'No se pudo obtener la URL de la imagen' });
    }
});

export default router;