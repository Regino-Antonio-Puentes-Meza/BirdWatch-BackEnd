// authRoutes.js
import express from 'express';
import { login } from '../controllers/loginController.js';
import { register } from '../controllers/registerController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);

router.get('/', async(req, res) => {
    res.send('Ruta de autenticación');
});

export default router;