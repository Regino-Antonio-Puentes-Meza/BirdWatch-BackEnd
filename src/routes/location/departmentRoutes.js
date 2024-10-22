// routes/departmentRoutes.js
import express from 'express';
import { getDepartments, createDepartment } from '../../controllers/location/departmentController.js';

const router = express.Router();

router.get('/', getDepartments); // Obtener todos los departamentos
router.post('/', createDepartment); // Crear un nuevo departamento

export default router;
