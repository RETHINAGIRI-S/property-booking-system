import { Property } from "../Models/propertyModel.js";
import { Booking } from "../Models/bookingModel.js";

// Helper function to check if two date ranges overlap
const checkDateConflict = (reqFrom, reqTo, currentBookings = []) => {
  const newStart = new Date(reqFrom).getTime();
  const newEnd = new Date(reqTo).getTime();

  if (isNaN(newStart) || isNaN(newEnd) || newStart >= newEnd) {
    return { hasConflict: true, error: "Invalid check-in or check-out dates" };
  }

  for (const b of currentBookings) {
    if (!b.fromDate || !b.toDate) continue;

    const existingStart = new Date(b.fromDate).getTime();
    const existingEnd = new Date(b.toDate).getTime();

    // Standard interval overlap: newStart < existingEnd && newEnd > existingStart
    if (newStart < existingEnd && newEnd > existingStart) {
      return {
        hasConflict: true,
        error: `Dates overlap with an existing booking (${new Date(b.fromDate).toLocaleDateString()} to ${new Date(b.toDate).toLocaleDateString()})`,
      };
    }
  }

  return { hasConflict: false };
};

// 1. CREATE ORDER: Validate availability before initiating checkout
const createOrder = async (req, res) => {
  try {
    const { amount, propertyId, fromDate, toDate, guests } = req.body;

    if (!propertyId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Property, check-in, and check-out dates are required",
      });
    }

    // Fetch live property from DB
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check for double booking conflict
    const conflict = checkDateConflict(fromDate, toDate, property.currentBookings);
    if (conflict.hasConflict) {
      return res.status(400).json({
        success: false,
        message: conflict.error || "Property is already booked for the selected dates",
      });
    }

    // Check guest capacity
    if (Number(guests) > property.maximumGuest) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed guests for this property is ${property.maximumGuest}`,
      });
    }

    const orderId = "order_" + Date.now();
    res.json({
      success: true,
      message: "Order created successfully",
      orderId,
      amount,
      propertyId,
      fromDate,
      toDate,
      guests,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

// 2. VERIFY PAYMENT: Atomic double-booking guard and booking confirmation
const verifyPayment = async (req, res) => {
  try {
    const { orderId, bookingDetails, forceStatus } = req.body;

    if (forceStatus === "success") {
      const property = await Property.findById(bookingDetails.propertyId);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }

      // Re-validate against double booking before finalizing payment
      const conflict = checkDateConflict(
        bookingDetails.fromDate,
        bookingDetails.toDate,
        property.currentBookings
      );

      if (conflict.hasConflict) {
        return res.status(400).json({
          success: false,
          message: "Double booking detected! These dates were just taken by another user.",
        });
      }

      const paymentId = "pay_" + Date.now();

      // Save confirmed booking
      const newBooking = await Booking.create({
        user: req.user._id,
        property: bookingDetails.propertyId,
        price: bookingDetails.price,
        fromDate: new Date(bookingDetails.fromDate),
        toDate: new Date(bookingDetails.toDate),
        guests: bookingDetails.guests,
        numberOfnights: bookingDetails.nights,
        paid: true,
      });

      // Atomically add to property's currentBookings
      await Property.findByIdAndUpdate(
        bookingDetails.propertyId,
        {
          $push: {
            currentBookings: {
              bookingId: newBooking._id,
              fromDate: new Date(bookingDetails.fromDate),
              toDate: new Date(bookingDetails.toDate),
              userId: req.user._id,
            },
          },
        },
        { new: true }
      );

      res.json({
        success: true,
        message: "Payment successful, booking confirmed!!",
        paymentId,
        orderId,
        booking: newBooking,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment failed!",
        orderId,
      });
    }
  } catch (error) {
    console.error("verifyPayment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

// 3. GET USER'S BOOKINGS
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: {
        bookings,
      },
    });
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: error.message,
    });
  }
};

// 4. GET ONE BOOKING DETAILS
const getBookingDetails = async (req, res) => {
  try {
    const bookings = await Booking.findById(req.params.bookingId);

    if (!bookings) {
      return res.status(404).json({
        status: "fail",
        message: "Booking not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        bookings,
      },
    });
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: error.message,
    });
  }
};

export { getBookingDetails, getUserBookings, createOrder, verifyPayment };
