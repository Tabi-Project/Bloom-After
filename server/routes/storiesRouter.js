import express from "express";
import {
  getAllStories,
  getStoryById,
  submitStory,
} from "../controllers/storiesController.js";

const router = express.Router();

router.post("/", submitStory);
router.get("/", getAllStories);
router.get("/:id", getStoryById);

export default router;
