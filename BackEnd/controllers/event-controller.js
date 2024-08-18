import Event from "../models/event-model.js";
import Joi from "joi";
import mongoose from "mongoose";

const eventSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  date: Joi.date().required(),
  attendees: Joi.array().items(Joi.string().length(24)),
});

export const createEvent = async (req, res) => {
  const { error } = eventSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { title, description, date, attendees } = req.body;

  let attendeesArray = [];
  if (attendees) {
    try {
      attendeesArray = attendees.map((id) => mongoose.Types.ObjectId(id));
    } catch (err) {
      return res.status(400).send("Invalid attendee IDs");
    }
  }

  try {
    const event = new Event({
      title,
      description,
      date,
      attendees: attendeesArray,
    });
    await event.save();

    res.status(201).json(event);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("attendees", "name email age");

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).send("Server error");
  }
};

export const registerForEvent = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send("Invalid user ID");
  }

  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).send("Event not found");

    const userObjectId = mongoose.Types.ObjectId(userId);

    if (!event.attendees.includes(userObjectId)) {
      event.attendees.push(userObjectId);
      await event.save();
    }

    res.status(200).json(event);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};

export const getEventAttendees = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id).populate(
      "attendees",
      "name email age"
    );
    if (!event) return res.status(404).send("Event not found");

    res.status(200).json(event.attendees);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).send("Event not found");

    res.status(200).send("Event deleted");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};
