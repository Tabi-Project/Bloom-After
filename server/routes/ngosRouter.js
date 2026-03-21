import express from 'express';
import { getAllNgos, getNgoById, submitNgo } from '../controllers/ngosController.js';

const router = express.Router();

router.get('/', getAllNgos);
router.get('/:id', getNgoById);
router.post('/submissions', submitNgo);

export default router;
