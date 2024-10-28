import express from 'express';
import { createDepartment, getDepartments } from '../../controllers/location/departmentController.js';

const router = express.Router();

router.post('/', createDepartment);
router.get('/', getDepartments);

export default router;