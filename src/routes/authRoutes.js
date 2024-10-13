// authRoutes.js
import express from 'express';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);

router.get('/', async(req, res) => {
    res.send('Ruta de autenticación');
});

export default router;