import express from 'express';
import { createNews, getAllNews, getNewsById, updateNews, deleteNews } from '../controllers/newsController.js';

const router = express.Router();

// Middleware para registrar las solicitudes
router.use((req, res, next) => {
    console.log(`Solicitud ${req.method} en la ruta ${req.originalUrl}`);
    next(); // Llama a next() para pasar al siguiente middleware o controlador
});

router.post('/', createNews);
router.get('/', getAllNews);
router.get('/:id', getNewsById);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);

export default router;
