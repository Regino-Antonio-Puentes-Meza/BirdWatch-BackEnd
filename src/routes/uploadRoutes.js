import express from 'express';
import uploadToAzure from '../middlewares/upload.js';
import messages from '../utils/messages.js'; // Asegúrate que esta ruta sea correcta
const router = express.Router();

// Middleware para registrar las solicitudes
router.use((req, res, next) => {
    console.log(`Solicitud ${req.method} en la ruta ${req.originalUrl}`);
    next();
});

router.post('/upFile', uploadToAzure, (req, res) => {
    if (req.body.imageUrl) {
        res.status(200).json({ message: messages.UPLOAD.IMAGE_UPLOAD, url: req.file.url }); 
    } else {
        res.status(400).json({ error: messages.UPLOAD.IMAGE_URL_NOT_FOUND }); 
    }
});

export default router;