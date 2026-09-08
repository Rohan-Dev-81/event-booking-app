import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/config.js";

const generateOTP = () => {
 const otp = Math.floor(100000 + Math.random() * 900000);
 return otp.toString();
}

const generateToken = (id, role) => {
 return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "1d" });
}

export const registerController = async (req, res) => {
 try {
  const { name, email, password, role } = req.body;
  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
   return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  user = await User.create({
   name,
   email,
   password: hashPassword,
   role: 'user', // Hardcoded to prevent frontend passing role
   isVerified: false
  });

  res.status(201).json({ message: "User registered successfully", user });
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: "Internal server error", error: error.message });
 }
}