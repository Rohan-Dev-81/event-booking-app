import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/config.js";
import Otp from "../models/otp.model.js";

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

  const otp = generateOTP();
  await Otp.create({ email, otp, action: 'account_verification' });
  await sendOTPEmail(email, otp, 'account_verification');

  res.status(201).json({ message: "OTP sent successfully", email: user.email });
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: "Internal server error", error: error.message });
 }
}


export const loginController = async (req, res) => {
 try {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
   return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
   return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id, user.role);

  if (!user.isVerified && user.role !== 'admin') {
   const otp = generateOTP();
   await Otp.findOneAndDelete({ email: user.email, action: 'account_verification' });
   await Otp.create({ email: user.email, otp, action: 'account_verification' });
   await sendOTPEmail(user.email, otp, 'account_verification');
   return res.status(403).json({ message: 'Account not verified', needsVerification: true, email: user.email });
  }

  res.status(200).json({
   message: "Login successful",
   user: {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
   },
   token: generateToken(user.id, user.role)
  });
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: "Internal server error", error: error.message });
 }
}


export const verifyOtpController = async (req, res) => {
 try {
  const { email, otp } = req.body;
  const validOTP = await Otp.findOne({ email, otp, action: 'account_verification' });

  if (!validOTP) {
   return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
  await Otp.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

  res.json({
   _id: user.id,
   name: user.name,
   email: user.email,
   role: user.role,
   token: generateToken(user.id, user.role)
  });
 } catch (error) {
  res.status(500).json({ message: 'Server Error' });
 }

}