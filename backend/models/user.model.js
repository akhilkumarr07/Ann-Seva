const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: false, default: "" },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: {
      landmark: { type: String, required: false, default: "" },
      lat: { type: Number, required: true },
      long: { type: Number, required: true },
    },
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    role: {
      type: String,
      default: "donor",
      enum: ["donor", "receiver", "volunteer", "admin"],
    },
    rating: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;