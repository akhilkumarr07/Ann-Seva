const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      landmark: { type: String, required: false, default: "" },
      lat: { type: Number, required: true },
      long: { type: Number, required: true },
    },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "pickby", "completed", "self_pickup", "assigning_volunteer", "pickbyreceiver", "pickbydonor", "requestacceptedbyvolunteer", "pickbyvolunteer", "rejected", "cancelled"],
      default: "pending",
    },
    shelfLife: { type: Number, required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    needVolunteer: { type: Boolean, default: false },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    pictureUrl: { type: String },
    isReceiverRequest: {
      type: Boolean,
      default: false,
    },
    cancelReason: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Donation || mongoose.model("Donation", donationSchema);

