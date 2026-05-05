const Donation = require("../models/donation.model");
const User = require("../models/user.model");
const ReceiverRequest = require("../models/request.model");

// Fetch donor history
const donorHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: "User not authenticated or ID missing" });
    }
    const donations = await Donation.find({
      donorId: req.user.id,
      status: { $in: ["completed", "cancelled", "rejected"] },
    })
      .populate("volunteerId", "name phone location")
      .populate("donorId", "name phone location")
      .populate("receiverId", "name phone location");

    const response = await fetchReceiverDetails(donations);
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching donor history:", err);
    res.status(500).json({ error: err.message });
  }
};

// Fetch receiver history
const receiverHistory = async (req, res) => {
  try {
    const donations = await Donation.find({
      receiverId: req.user.id,
      status: { $in: ["completed", "cancelled", "rejected"] },
    })
      .populate("volunteerId", "name phone location")
      .populate("donorId", "name phone location");

    const response = await fetchReceiverDetails(donations);
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching receiver history:", err);
    res.status(500).json({ error: err.message });
  }
};

// Fetch volunteer history
const volunteerHistory = async (req, res) => {
  try {
    const donations = await Donation.find({
      volunteerId: req.user.id,
      status: { $in: ["completed", "cancelled", "rejected"] },
    })
      .populate("volunteerId", "name phone location")
      .populate("donorId", "name phone location");

    const response = await fetchReceiverDetails(donations);
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching volunteer history:", err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to fetch receiver details
const fetchReceiverDetails = async (donations) => {
  return await Promise.all(
    donations.map(async (donation) => {
      let receiverDetails = { name: "Unknown Receiver", phone: "N/A", location: { landmark: "N/A" } };
      let volunteerDetails = { name: "No volunteer assigned", phone: "N/A", location: { landmark: "N/A" } };
      let donorDetails = donation.donorId || { name: "Unknown Donor", phone: "N/A", location: { landmark: "N/A" } };

      if (donation.receiverId) {
        // First check User model (Organizations and targeted individuals)
        const user = await User.findById(donation.receiverId).select("name phone location");
        if (user) {
          receiverDetails = {
            name: user.name,
            phone: user.phone,
            location: user.location || { landmark: "N/A" },
          };
        } else {
          // Fallback to Request model if it's an old record pointing to a request ID
          const receiverRequest = await ReceiverRequest.findById(donation.receiverId)
            .populate("receiverId", "name phone location");
          if (receiverRequest && receiverRequest.receiverId) {
            receiverDetails = {
              name: receiverRequest.receiverId.name,
              phone: receiverRequest.receiverId.phone,
              location: receiverRequest.receiverId.location || { landmark: "N/A" },
            };
          }
        }
      }

      if (donation.volunteerId) {
        const volunteer = await User.findById(donation.volunteerId).select("name phone location");
        if (volunteer) {
          volunteerDetails = {
            name: volunteer.name,
            phone: volunteer.phone,
            location: volunteer.location || { landmark: "N/A" },
          };
        }
      }

      return {
        donationId: donation._id,
        donor: donorDetails,
        volunteer: volunteerDetails,
        receiver: receiverDetails,
        donationDetails: {
          quantity: donation.quantity,
          status: donation.status,
          location: donation.location || { landmark: "N/A" },
          createdAt: donation.createdAt,
          cancelReason: donation.cancelReason,
        },
      };
    })
  );
};

module.exports = { donorHistory, receiverHistory, volunteerHistory };
