import express from "express";
import {
  createEvent,
  getEvents,
  registerForEvent,
  getEventAttendees,
  deleteEvent,
} from "../controllers/event-controller.js";
import { authenticate } from "../middleware/auth-middleware.js";

const router = express.Router();

router.post("/", authenticate, createEvent);
router.get("/", authenticate, getEvents);
router.post("/:id/register", authenticate, registerForEvent);
router.get("/:id/attendees", authenticate, getEventAttendees);
router.delete("/:id", authenticate, deleteEvent);

export default router;
