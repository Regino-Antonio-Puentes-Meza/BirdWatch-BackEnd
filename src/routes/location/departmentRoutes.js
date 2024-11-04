import express from 'express';
import { createDepartment, getDepartments } from '../../controllers/location/departmentController.js';

const router = express.Router();
// Middleware para registrar las solicitudes
router.use((req, res, next) => {
    console.log(`Solicitud ${req.method} en la ruta ${req.originalUrl}`);
    next();
});

router.post('/', createDepartment);
router.get('/', getDepartments);

export default router;