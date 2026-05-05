const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // null means system/admin
    },
    type: {
      type: String,
      enum: ["donor_alert", "volunteer_alert", "admin_assign", "general"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      // Could be RequestId or DonationId
      required: false,
    },
    referenceData: {
      // Store embedded data like donor/receiver info so frontend doesn't need to fetch
      type: Schema.Types.Mixed,
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
