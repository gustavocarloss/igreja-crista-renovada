import express from "express";
import { addEvent, listEvents, confirmPresence, updateEvent, deleteEvent } from "../controllers/eventController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/", authenticate, addEvent);
router.get("/", listEvents);
router.post("/confirm", authenticate, confirmPresence);
router.put("/:id", authenticate, updateEvent);
router.delete("/:id", authenticate, deleteEvent);

export default router;
