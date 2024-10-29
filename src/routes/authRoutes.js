import express from 'express';
import { login } from '../controllers/loginController.js';
import { register } from '../controllers/registerController.js';
import {resetPassword } from '../controllers/resetPasswordController.js';
import { forgotPassword } from '../controllers/forgotPasswordController.js';
// import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();
// Middleware para registrar las solicitudes
router.use((req, res, next) => {
    console.log(`Solicitud ${req.method} en la ruta ${req.originalUrl}`);
    next(); 
});

router.post('/login', login);
router.post('/register', register);

// Ruta para enviar el enlace de recuperación de contraseña
router.post('/forgot-password', forgotPassword);
// Ruta para restablecer la contraseña usando el token desde el enlace
router.post('/reset-password', resetPassword);

export default router;