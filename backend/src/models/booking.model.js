import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
 event: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Event",
  required: true,
 },
 userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
 },
 status: {
  type: String,
  enum: ["pending", "confirmed", "cancelled"],
  default: "pending",
 },
 bookingAt: {
  type: Date,
  default: Date.now,
 },
 amount: {
  type: Number,
  required: true,
 },
 paymentStatus: {
  type: String,
  enum: ["paid", "not_paid"],
  default: "not_paid",
 },

}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;