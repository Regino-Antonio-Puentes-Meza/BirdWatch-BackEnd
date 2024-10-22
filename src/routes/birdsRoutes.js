import express from 'express';
import { createBird,  getAllBirds, getBirdById, updateBird, deleteBird,} from '../controllers/birdController.js';

const router = express.Router();

router.post('/create', createBird); 
router.get('/', getAllBirds);
router.get('/:id', getBirdById); 
router.put('/:id', updateBird); 
router.delete('/:id', deleteBird);          

export default router;