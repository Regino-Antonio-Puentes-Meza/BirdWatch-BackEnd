import express from 'express';
import uploadToAzure from '../middleware/upload.js';
const router = express.Router();

router.post('/upload', uploadToAzure, (req, res) => {
    if (req.file && req.file.url) {
        res.status(200).json({ message: 'Imagen subida correctamente', url: req.file.url });
    } else {
        res.status(400).json({ error: 'No se pudo obtener la URL de la imagen' });
    }
});

export default router;