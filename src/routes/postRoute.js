import express from "express";
import { createPost, deletePost, getPost, getTimelinePosts, likePost, updatePost } from "../controllers/postController.js";
import uploadToAzure from '../middlewares/upload.js'; // Importa el middleware para subir la imagen

const router = express.Router();

// Middleware para registrar las solicitudes
router.use((req, res, next) => {
    console.log(`Solicitud ${req.method} en la ruta ${req.originalUrl}`);
    next();
});

router.post('/', uploadToAzure, createPost);
router.get('/:id', getPost);
router.put('/:id', updatePost);
router.delete("/:id", deletePost);
router.put("/:id/like", likePost);
router.get("/:id/timeline", getTimelinePosts);

export default router;
