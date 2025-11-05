import express from "express";
import { addVerse, getVerseOfDay, importVerses } from "../controllers/verseController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/daily", getVerseOfDay);
router.post("/", authenticate, addVerse);
router.post("/import", authenticate, importVerses);

export default router;
