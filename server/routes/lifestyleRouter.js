import express from "express";
import { getAllLifestyle, getLifestyleById } from '../controllers/lifestyleController.js';

const router = express.Router();

router.get('/', getAllLifestyle);
router.get('/:id', getLifestyleById);

export default router;
