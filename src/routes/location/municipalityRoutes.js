// routes/municipalityRoutes.js
import express from 'express';
import { getMunicipalitiesByDepartment, createMultipleMunicipalities } from '../../controllers/location/municipalityController.js';

const router = express.Router();

router.get('/:departmentId', getMunicipalitiesByDepartment); // Obtener municipios por departamento
router.post('/multiple', createMultipleMunicipalities);

export default router;
