import express from "express";
import { createPost, deletePost, getPost, getTimelinePosts, likePost, updatePost, getRandomPosts } from "../controllers/postController.js";

const router = express.Router();

// Middleware para registrar las solicitudes
router.use((req, res, next) => {
    console.log(`Solicitud ${req.method} en la ruta ${req.originalUrl}`);
    next();
});

router.post('/', createPost);
router.get("/random", getRandomPosts);
router.get('/:id', getPost);
router.put('/:id', updatePost);
router.delete("/:id", deletePost);
router.put("/:id/like", likePost);
router.get("/:id/timeline", getTimelinePosts);

export default router;
