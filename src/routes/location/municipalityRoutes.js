// routes/municipalityRoutes.js
import express from 'express';
import { getMunicipalitiesByDepartment, createMunicipality } from '../../controllers/location/municipalityController.js';

const router = express.Router();

router.get('/:departmentId', getMunicipalitiesByDepartment); // Obtener municipios por departamento
router.post('/', createMunicipality); // Crear un nuevo municipio

export default router;
