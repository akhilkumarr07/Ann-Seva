const Request = require("../models/request.model");
const User = require("../models/user.model");
const Donation = require("../models/donation.model");
const mongoose = require("mongoose");

const postRequest = async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ success: false, message: "Valid quantity is required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newRequest = new Request({
      receiverId: req.user.id,
      receiverName: user.name,
      receiverPhone: user.phone,
      receiverAddress: user.location.landmark || "",
      receiverLocation: {
        name: user.location.landmark || "",
        lat: user.location.lat,
        long: user.location.long,
      },
      quantity,
    });

    const savedRequest = await newRequest.save();

    try {
      const donors = await User.find({ role: "donor" });
      const userLat = savedRequest.receiverLocation.lat;
      const userLong = savedRequest.receiverLocation.long;
      
      const toRad = (val) => (val * Math.PI) / 180;
      const nearbyDonors = donors.filter((d) => {
        if (!d.location || d.location.lat == null) return false;
        const dLat = toRad(d.location.lat - userLat);
        const dLon = toRad(d.location.long - userLong);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(userLat)) * Math.cos(toRad(d.location.lat)) * Math.sin(dLon / 2) ** 2;
        const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return distanceKm <= 5; // within 5km
      });

      const Notification = require("../models/notification.model");
      const io = req.app.get("io");
      const userSockets = req.app.get("userSockets");

      const notificationsToSave = nearbyDonors.map(donor => ({
        recipientId: donor._id,
        senderId: user._id,
        type: "donor_alert",
        message: `New food request nearby! ${savedRequest.quantity} items requested by ${savedRequest.receiverName}.`,
        referenceId: savedRequest._id,
        referenceData: {
          receiverName: savedRequest.receiverName,
          quantity: savedRequest.quantity,
          location: savedRequest.receiverLocation.name,
        }
      }));

      if (notificationsToSave.length > 0) {
        const savedNotifs = await Notification.insertMany(notificationsToSave);
        savedNotifs.forEach(notif => {
          if (userSockets && io) {
            const socketId = userSockets.get(notif.recipientId.toString());
            if (socketId) io.to(socketId).emit("receive_notification", notif);
          }
        });
      }
    } catch(err) {
      console.error("Error creating donor notifications:", err.message);
    }

    res.status(201).json({ success: true, message: "Request added successfully", request: savedRequest });
  } catch (error) {
    console.error("Error creating request:", error.message);
    res.status(500).json({ success: false, msg: "Error creating request", error: error.message });
  }
};

const getActiveRequests = async (req, res) => {
  try {
    const requests = await Request.find({ isActive: true });
    const organizations = await User.find({ role: "receiver", isActive: true });
    res.status(200).json({ msg: "Retrieved Active requests successfully", requests, organizations });
  } catch (error) {
    console.error("Error finding requests:", error.message);
    res.status(500).json({ msg: "Error finding requests", error: error.message });
  }
};

const getDonations = async (req, res) => {
  try {
    const donation = await Donation.find({ receiverId: req.user.id, status: "pending" });
    if (!donation || donation.length === 0) {
      return res.status(200).json({ success: true, message: "No pending donations", donations: [] });
    }
    res.status(200).json(donation);
  } catch (err) {
    console.error("Error fetching donations:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deletedRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }
    res.status(200).json({ msg: "Request successfully deleted", deletedRequest: request });
  } catch (error) {
    console.error("Error deleting request:", error.message);
    res.status(500).json({ msg: "Failed to delete the request", error: error.message });
  }
};

const getActiveDonation = async (req, res) => {
  try {
    const pendingDonations = await Donation.find({
      status: "pending",
      $or: [
        { receiverId: req.user.id },
        { receiverId: { $exists: false } },
        { receiverId: null },
      ],
    }).populate("donorId", "name email phone");

    const formattedPendingDonations = pendingDonations.map((dn) => ({
      donationId: dn._id,
      donorName: dn.donorId ? dn.donorId.name : "Unknown Donor",
      donorEmail: dn.donorId ? dn.donorId.email : "No Email",
      donorPhone: dn.donorId ? dn.donorId.phone : "No Phone",
      quantity: dn.quantity,
      location: dn.location ? dn.location.landmark : "Unknown",
    }));

    const approvedDonations = await Donation.find({
      status: { $in: ["approved", "requestacceptedbyvolunteer", "pickbydonor", "pickbyvolunteer"] },
      receiverId: req.user.id,
    })
      .populate("donorId", "name email phone")
      .populate("volunteerId", "name email phone");

    const formattedApprovedDonations = approvedDonations.map((dn) => ({
      donationId: dn._id,
      donorName: dn.donorId ? dn.donorId.name : "Unknown Donor",
      donorEmail: dn.donorId ? dn.donorId.email : "No Email",
      donorPhone: dn.donorId ? dn.donorId.phone : "No Phone",
      volunteerName: dn.volunteerId ? dn.volunteerId.name : "No Volunteer Assigned",
      volunteerEmail: dn.volunteerId ? dn.volunteerId.email : "No Email",
      volunteerPhone: dn.volunteerId ? dn.volunteerId.phone : "No Phone",
      quantity: dn.quantity,
      location: dn.location ? dn.location.landmark : "Unknown",
    }));

    return res.status(200).json({
      success: true,
      message: "Donation details fetched successfully",
      pendingDonations: formattedPendingDonations,
      approvedDonations: formattedApprovedDonations,
    });
  } catch (error) {
    console.error("Error fetching donation details:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

const acceptDonation = async (req, res) => {
  const { donationId, approveDonation, acceptasVolunteer } = req.body;

  try {
    if (approveDonation === undefined || acceptasVolunteer === undefined) {
      return res.status(400).json({ success: false, message: "Both approveDonation and acceptasVolunteer are required" });
    }

    const donation = await Donation.findOne({ _id: donationId });
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    if (approveDonation) {
      donation.status = "approved";
    }

    if (acceptasVolunteer) {
      donation.needVolunteer = false;
      donation.status = "pickbyreceiver";
    }

    if (req.body.volunteerId && req.body.volunteerId !== donation.volunteerId) {
      donation.volunteerId = req.body.volunteerId;
    }

    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation status updated successfully",
      updatedDonation: {
        status: donation.status,
        volunteerId: donation.volunteerId,
        needVolunteer: donation.needVolunteer,
      },
    });
  } catch (err) {
    console.error("Error updating donation status:", err.message);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

const rejectDonation = async (req, res) => {
  const { donationId } = req.body;

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }
    donation.status = "rejected";
    await donation.save();
    res.status(200).json({ success: true, message: "Donation rejected successfully", donation });
  } catch (err) {
    console.error("Error rejecting donation:", err.message);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

const completeDonation = async (req, res) => {
  const { donationId } = req.body;
  try {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }
    donation.status = "completed";
    await donation.save();
    res.status(200).json({ success: true, message: "Donation completed successfully", donation });
  } catch (err) {
    console.error("Error completing donation:", err.message);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

const cancelRequest = async (req, res) => {
  const { requestId, reason } = req.body;
  try {
    const request = await Request.findOne({ _id: requestId, receiverId: req.user.id });
    if (!request) return res.status(404).json({ success: false, message: "Request not found or unauthorized" });

    request.status = "cancelled";
    request.cancelReason = reason;
    request.isActive = false;
    await request.save();

    res.status(200).json({ success: true, message: "Request cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error cancelling request", error: error.message });
  }
};

module.exports = {
  postRequest,
  getActiveRequests,
  deletedRequest,
  getActiveDonation,
  acceptDonation,
  rejectDonation,
  getDonations,
  completeDonation,
  cancelRequest,
};
