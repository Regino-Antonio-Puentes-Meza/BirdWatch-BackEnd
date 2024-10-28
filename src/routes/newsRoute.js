import express from 'express';
import { createNews, getAllNews, getNewsById, updateNews, deleteNews } from '../controllers/newsController.js';

const router = express.Router();

// Crear una noticia
router.post('/', createNews);

// Obtener todas las noticias
router.get('/', getAllNews);

// Obtener una noticia por ID
router.get('/:id', getNewsById);

// Actualizar una noticia
router.put('/:id', updateNews);

// Eliminar una noticia
router.delete('/:id', deleteNews);

export default router;
