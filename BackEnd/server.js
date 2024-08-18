import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import eventModel from "./models/event-model.js";
import userModel from "./models/user-model.js";
import { getAllEvents } from "./controllers/event-controller.js";

dotenv.config();
const mongodbUri = process.env.MONGODB_URI;
if (!mongodbUri) {
  console.error("MongoDB URI is not defined in environment variables");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(mongodbUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

const User = userModel;
const Event = eventModel;

app.post("/api/auth/register", async (req, res) => {
  const { name, username, email, password, age } = req.body;

  if (!name || !username || !email || !password || !age) {
    return res.status(400).json({
      message:
        '"name", "username", "email", "password", and "age" are required',
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
      age,
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: '"email" and "password" are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/events", async (req, res) => {
  const { title, date, description, attendees } = req.body;

  if (!title || !date) {
    return res.status(400).json({ message: '"title" and "date" are required' });
  }

  if (attendees && !Array.isArray(attendees)) {
    return res.status(400).json({ message: '"attendees" should be an array' });
  }

  let attendeesArray = [];
  if (attendees) {
    if (Array.isArray(attendees)) {
      try {
        attendeesArray = attendees.map((id) => new mongoose.Types.ObjectId(id));

        const validAttendees = await User.find({
          _id: { $in: attendeesArray },
        });
        if (validAttendees.length !== attendeesArray.length) {
          return res
            .status(400)
            .json({ message: "Some attendee IDs are invalid" });
        }
      } catch (error) {
        console.error("Error processing attendees:", error);
        return res.status(400).json({ message: "Invalid attendees data" });
      }
    } else {
      return res
        .status(400)
        .json({ message: '"attendees" should be an array' });
    }
  }

  try {
    const newEvent = new Event({
      title,
      date,
      description,
      attendees: attendeesArray,
    });
    await newEvent.save();
    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().populate("attendees", "name email age");

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: '"name" and "email" are required' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 9090;
app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      throw err;
    }
  });
