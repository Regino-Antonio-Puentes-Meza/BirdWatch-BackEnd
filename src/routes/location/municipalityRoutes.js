import express from 'express';
import { getMunicipalitiesByDepartment, createMultipleMunicipalities } from '../../controllers/location/municipalityController.js';

const router = express.Router();

// Middleware para registrar las solicitudes
router.use((req, res, next) => {
  console.log(`Solicitud ${req.method} en la ruta ${req.originalUrl}`);
  next();
});

router.get('/:departmentId', getMunicipalitiesByDepartment); // Obtener municipios por departamento
router.post('/multiple', createMultipleMunicipalities);

export default router;
