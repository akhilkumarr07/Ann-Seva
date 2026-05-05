const mongoose = require("mongoose");
const { Schema } = mongoose;

const receiverRequestSchema = new mongoose.Schema(
  {
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverName: { type: String, required: true },
    receiverPhone: { type: String, required: true },
    receiverAddress: { type: String, required: true },
    receiverLocation: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      long: { type: Number, required: true },
    },
    quantity: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ReceiverRequest || mongoose.model("ReceiverRequest", receiverRequestSchema);
