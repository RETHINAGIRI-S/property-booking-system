import slugify from "slugify";
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  propertyName: {
    type: String,
    required: [true, "Please enter your property name"],
  },
  description: {
    type: String,
    required: [true, "Please add information about your property"],
  },
  extraInfo: {
    type: String,
    default: "checkin on time. good services.",
  },
  propertyType: {
    type: String,
    default: "House",
  },
  roomType: {
    type: String,
    default: "Anytype",
  },

  maximumGuest: {
    type: Number,
    required: [true, "Please give the maximum no of Guest that can occupy"],
  },

  amenities: [
    {
      name: {
        type: String,
        required: true,
      },
      icon: {
        type: String,
        default: "",
      },
    },
  ],
  images: {
    type: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    validate: {
      validator: function (arr) {
        return !arr || arr.length === 0 || arr.length >= 1;
      },
      message: "The images must contain at least 1 image",
    },
  },
  price: {
    type: Number,
    required: [true, "please enter the price per night value"],
    default: 500,
  },
  address: {
    area: String,
    city: String,
    state: String,
    pincode: Number,
  },
  currentBookings: [
    {
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
      fromDate: {
        type: Date,
      },
      toDate: {
        type: Date,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  slug: String,
  checkInTime: { type: String, default: "11:00" },
  checkOutTime: { type: String, default: "13:00" },
});

propertySchema.pre("save", function (next) {
  if (this.propertyName) {
    this.slug = slugify(this.propertyName, { lower: true });
  }
  if (typeof next === "function") next();
});

propertySchema.pre("save", function (next) {
  if (this.address && this.address.city) {
    this.address.city = this.address.city.toLowerCase().replaceAll(" ", "");
  }
  if (typeof next === "function") next();
});

const Property =
  mongoose.models.Property || mongoose.model("Property", propertySchema);

export { Property };
