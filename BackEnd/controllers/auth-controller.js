import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user-model.js";
import Joi from "joi";

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  age: Joi.number().required(),
});

export const registerUser = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, email, password, age } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).send("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const min = Math.ceil(1000);
    const max = Math.floor(999999);
    const rnd = Math.floor(Math.random() * (max - min + 1)) + min;
    const username = "user" + rnd;
    const user = new User({
      username,
      name,
      email,
      password: hashedPassword,
      age,
    });
    await user.save();

    res.status(201).send("User registered successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};
