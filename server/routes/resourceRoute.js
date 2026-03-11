import express from "express";
import { getALLResources, getResourceById } from "../controllers/resourcesController.js";

const router = express.Router();

router.get("/", getALLResources);
router.get("/:id", getResourceById);

export default router;