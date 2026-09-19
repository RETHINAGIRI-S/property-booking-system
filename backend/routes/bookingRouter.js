import express from "express";
const bookingRouter = express.Router();

import {
  getBookingDetails,
  getUserBookings,
  createOrder,
  verifyPayment,
} from "../controllers/bookingController.js";

import { protect } from "../controllers/authController.js";

bookingRouter.get("/", protect, getUserBookings);
bookingRouter.get("/my-bookings", protect, getUserBookings);
bookingRouter.get("/user/mybookings", protect, getUserBookings);
bookingRouter.post("/create-order", protect, createOrder);
bookingRouter.post("/verify-payment", protect, verifyPayment);
bookingRouter.get("/:bookingId", protect, getBookingDetails);

export { bookingRouter };
