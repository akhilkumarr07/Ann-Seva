const errorHandler = require("express-async-handler");
const Donation = require("../models/donation.model");
const User = require("../models/user.model");
const Request = require("../models/request.model");
const bcrypt = require("bcrypt");

const getAllDonations = errorHandler(async (req, res) => {
  try {
    const donations = await Donation.find().populate("donorId", "name phone email location");
    res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ message: "Error fetching donations" });
  }
});

const getAllRequests = errorHandler(async (req, res) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const requests = await Request.find({
      $or: [
        { status: { $ne: "cancelled" } },
        { status: "cancelled", updatedAt: { $gt: oneHourAgo } }
      ]
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Error fetching requests" });
  }
});

const getAllUsers = errorHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

const getUserById = errorHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});

const updateUserById = errorHandler(async (req, res) => {
  const { name, email, location, currentPassword } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // If there's a password check involved, we verify the admin's password or the user's?
  // User said "asks password confirmation". Usually it's the admin verifying their identity for this action.
  // We'll compare against the current user's (admin's) password.
  const admin = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid password confirmation" });

  if (name) user.name = name;
  if (email) user.email = email;
  if (location) user.location = location;

  await user.save();
  res.status(200).json({ success: true, message: "User updated successfully", user });
});

const cancelDonation = errorHandler(async (req, res) => {
  const { donationId, reason } = req.body;
  try {
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    donation.status = "cancelled";
    donation.cancelReason = reason;
    donation.cancelledBy = req.user.id;
    await donation.save();

    res.status(200).json({ success: true, message: "Donation cancelled successfully", donation });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling donation", error: error.message });
  }
});

const cancelRequest = errorHandler(async (req, res) => {
  const { requestId, reason } = req.body;
  try {
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "cancelled";
    request.cancelReason = reason;
    request.isActive = false;
    await request.save();

    res.status(200).json({ success: true, message: "Request cancelled successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling request", error: error.message });
  }
});

const approveDonation = errorHandler(async (req, res) => {
  const { donationId } = req.body;
  const donation = await Donation.findByIdAndUpdate(donationId, { status: "approved" }, { new: true });
  if (!donation) return res.status(404).json({ message: "Donation not found" });
  res.status(200).json({ success: true, message: "Donation approved.", donation });
});

const approveRequest = errorHandler(async (req, res) => {
  const { requestId } = req.body;
  const request = await Request.findByIdAndUpdate(requestId, { status: "approved" }, { new: true });
  if (!request) return res.status(404).json({ message: "Request not found" });
  res.status(200).json({ success: true, message: "Request approved.", request });
});

const assignVolunteerAdmin = errorHandler(async (req, res) => {
  const { donationId, volunteerId } = req.body;
  const donation = await Donation.findByIdAndUpdate(donationId, { volunteerId, needVolunteer: false, status: "pickbyvolunteer" }, { new: true });
  if (!donation) return res.status(404).json({ message: "Donation not found" });

  try {
    const Notification = require("../models/notification.model");
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");
    
    const donorUser = await User.findById(donation.donorId);
    let receiverData = null;
    if (donation.receiverId) {
       const recUser = await User.findById(donation.receiverId);
       if (recUser) {
          receiverData = { name: recUser.name, phone: recUser.phone, location: recUser.location ? recUser.location.landmark : "Unknown" };
       }
    }

    const notifInfo = {
      recipientId: volunteerId,
      senderId: req.user ? req.user.id : null,
      type: "admin_assign",
      message: `Admin assigned you to a pickup!`,
      referenceId: donation._id,
      referenceData: {
        donorName: donorUser ? donorUser.name : "Unknown",
        donorPhone: donorUser ? donorUser.phone : "Unknown",
        donorLocation: donation.location ? donation.location.landmark : "Unknown",
        receiverName: receiverData ? receiverData.name : "Unknown",
        receiverPhone: receiverData ? receiverData.phone : "Unknown",
        receiverLocation: receiverData ? receiverData.location : "Unknown",
        quantity: donation.quantity
      }
    };

    const savedNotif = await Notification.create(notifInfo);
    if (userSockets && io) {
      const socketId = userSockets.get(volunteerId.toString());
      if (socketId) io.to(socketId).emit("receive_notification", savedNotif);
    }
  } catch(err) {
    console.error("Error creating admin notification:", err.message);
  }

  res.status(200).json({ success: true, message: "Volunteer assigned successfully.", donation });
});

const completeDonationAdmin = errorHandler(async (req, res) => {
  const { donationId } = req.body;
  const donation = await Donation.findByIdAndUpdate(donationId, { status: "completed" }, { new: true });
  if (!donation) return res.status(404).json({ message: "Donation not found" });
  res.status(200).json({ success: true, message: "Donation marked completed.", donation });
});

module.exports = {
  getAllDonations,
  getAllRequests,
  getAllUsers,
  cancelDonation,
  cancelRequest,
  approveDonation,
  approveRequest,
  assignVolunteerAdmin,
  completeDonationAdmin,
  getUserById,
  updateUserById,
};
