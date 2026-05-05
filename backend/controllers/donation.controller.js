const asyncHandler = require("express-async-handler");
const Donation = require("../models/donation.model");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Request = require("../models/request.model");
const upload = require("../utils/multerconfig");

const postDonation = asyncHandler(async (req, res) => {
  const {
    quantity,
    receiverId,
    shelfLife,
    location,
    requestId,
    isOrganisation,
    orgID,
  } = req.body;

  // Reconstruct location if it's coming from FormData as flat fields
  let processedLocation = req.body.location;
  if (!processedLocation && req.body["location[lat]"]) {
    processedLocation = {
      landmark: req.body["location[landmark]"] || "No landmark provided",
      lat: parseFloat(req.body["location[lat]"]),
      long: parseFloat(req.body["location[long]"]),
    };
  }

  // Fallback to user's registered location if still missing
  if (!processedLocation || !processedLocation.lat) {
    const user = await User.findById(req.user.id);
    if (user && user.location) {
      processedLocation = {
        landmark: user.location.landmark || "Registered Location",
        lat: user.location.lat,
        long: user.location.long,
      };
    }
  }

  try {
    const user = req.user;
    const donorId = user.id;

    let receiverObjectId = null;

    if (
      receiverId !== undefined &&
      receiverId !== null &&
      receiverId !== "undefined" &&
      receiverId !== ""
    ) {
      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ msg: "Invalid receiverId" });
      }
      receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    }

    // Fix: field should be pictureUrl to match schema
    let pictureUrl = "";
    if (req.file) pictureUrl = req.file.filename;

    let volunteerId = null;

    const userObj = await User.findById(donorId);
    if (userObj && userObj.role === "volunteer") {
      volunteerId = userObj._id;
    }

    let organisationId = null;
    const isOrg = isOrganisation === "true" || isOrganisation === true;
    if (isOrg && orgID && orgID !== "" && orgID !== "null" && orgID !== "undefined") {
      if (!mongoose.Types.ObjectId.isValid(orgID)) {
        return res.status(400).json({ msg: "Invalid orgID" });
      }
      organisationId = new mongoose.Types.ObjectId(orgID);
    }

    // Default needVolunteer to true for individual donations, even if targeted at a receiver.
    // Organisations usually handle their own pickup/delivery.
    const needsVolunteer = isOrg ? false : true;

    const newDonation = new Donation({
      donorId,
      location: processedLocation,
      quantity: Number(quantity),
      status: "pending",
      shelfLife: Number(shelfLife),
      receiverId: isOrganisation ? organisationId : receiverObjectId,
      needVolunteer: needsVolunteer,
      volunteerId: volunteerId,
      pictureUrl: pictureUrl,       // Fixed: was `donationPicture` (mismatch with schema)
    });

    if (!isOrganisation && requestId) {
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ msg: "Invalid requestId" });
      }
      const requestObjectId = new mongoose.Types.ObjectId(requestId);

      const request = await Request.findOne({
        _id: requestObjectId,
        isActive: true,
      });

      if (!request) {
        return res.status(404).json({ msg: "Request not found (only active requests can be donated to)" });
      }

      if (quantity >= request.quantity) {
        request.quantity = 0;
        request.isActive = false;
      } else {
        request.quantity -= quantity;
      }
      await request.save();
    }

    const savedDonation = await newDonation.save();

    try {
      if (!isOrganisation && requestId && needsVolunteer) {
        const donorUser = await User.findById(donorId);
        let receiverData = null;
        if (receiverObjectId) {
          const recUser = await User.findById(receiverObjectId);
          if (recUser) {
            receiverData = {
              name: recUser.name,
              phone: recUser.phone,
              location: recUser.location ? recUser.location.landmark : "Unknown"
            };
          }
        }

        const volunteers = await User.find({ role: "volunteer" });
        const userLat = processedLocation.lat;
        const userLong = processedLocation.long;
        
        const toRad = (val) => (val * Math.PI) / 180;
        const nearbyVolunteers = volunteers.filter((v) => {
          if (!v.location || v.location.lat == null) return false;
          const vLat = toRad(v.location.lat - userLat);
          const vLon = toRad(v.location.long - userLong);
          const a =
            Math.sin(vLat / 2) ** 2 +
            Math.cos(toRad(userLat)) * Math.cos(toRad(v.location.lat)) * Math.sin(vLon / 2) ** 2;
          const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return distanceKm <= 5;
        });

        const Notification = require("../models/notification.model");
        const io = req.app.get("io");
        const userSockets = req.app.get("userSockets");

        const notificationsToSave = nearbyVolunteers.map(vol => ({
          recipientId: vol._id,
          senderId: donorId,
          type: "volunteer_alert",
          message: `Pickup needed! Donor ${donorUser.name} accepted a request.`,
          referenceId: savedDonation._id,
          referenceData: {
            donorName: donorUser.name,
            donorPhone: donorUser.phone,
            donorLocation: processedLocation.landmark,
            receiverName: receiverData ? receiverData.name : "Unknown",
            receiverPhone: receiverData ? receiverData.phone : "Unknown",
            receiverLocation: receiverData ? receiverData.location : "Unknown",
            quantity: quantity,
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
      }
    } catch(err) {
      console.error("Error creating volunteer notifications:", err.message);
    }

    res.status(201).json({ msg: "Donation request sent successfully", savedDonation });
  } catch (err) {
    console.error("Error creating donation:", err);
    res.status(400).json({ msg: "Error creating donation", error: err.message });
  }
});

const deleteDonation = async (req, res) => {
  const donationId = req.params.id;
  try {
    const donation = await Donation.findByIdAndDelete(donationId);
    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" });
    }
    res.status(200).json({ msg: "Donation deleted successfully", deletedDonation: donation });
  } catch (error) {
    console.error("Error deleting donation:", error);
    res.status(500).json({ msg: "Error deleting donations", error: error.message });
  }
};

const acceptDonation = async (req, res) => {
  const { volunteer } = req.body;
  const donationId = req.params.id;

  try {
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" });
    }

    donation.needVolunteer = donation.needVolunteer && volunteer;
    donation.status = donation.needVolunteer ? "assigning_volunteer" : "self_pickup";

    const updatedDonation = await donation.save();

    res.status(200).json({ msg: "Donation updated successfully", updatedDonation });
  } catch (error) {
    console.error("Error accepting donation:", error.message);
    res.status(500).json({ msg: "Error accepting donation", error: error.message });
  }
};

const assignVolunteer = async (req, res) => {
  const volunteerId = req.user.id;
  const donationId = req.params.id;

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" });
    }
    donation.volunteerId = volunteerId;
    const updatedDonation = await donation.save();
    res.status(200).json({ msg: "Volunteer assigned successfully", updatedDonation });
  } catch (error) {
    console.error("Error assigning volunteer:", error.message);
    res.status(500).json({ msg: "Error assigning volunteer", error: error.message });
  }
};

const getDonations = async (req, res) => {
  try {
    const { lat, long } = req.body;

    if (!lat || !long) {
      return res.status(400).json({ msg: "Current location (lat and long) is required" });
    }

    const userLat = parseFloat(lat);
    const userLong = parseFloat(long);

    const donations = await Donation.find({
      "location.lat": { $exists: true },
      "location.long": { $exists: true },
      status: "accepted",
    });

    // Haversine formula to calculate distance in km
    const toRad = (val) => (val * Math.PI) / 180;
    const nearbyDonations = donations.filter((d) => {
      const dLat = toRad(d.location.lat - userLat);
      const dLon = toRad(d.location.long - userLong);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(userLat)) * Math.cos(toRad(d.location.lat)) * Math.sin(dLon / 2) ** 2;
      const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return distanceKm <= 5;
    });

    res.status(200).json(nearbyDonations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ msg: "Error fetching donations", error: error.message });
  }
};

const donarAccept = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id });

    if (donations.length === 0) {
      return res.status(200).json({ msg: "No donations currently", donations: [] });
    }

    const matchedDonations = await Promise.all(
      donations
        .filter((donation) =>
          ["approved", "pickbyreceiver", "rejected", "pending", "pickbydonor", "requestacceptedbyvolunteer", "pickbyvolunteer"].includes(donation.status)
        )
        .map(async (donation) => {
          const donationObj = donation.toObject();

          if (donation.status === "requestacceptedbyvolunteer") {
            const volunteer = await User.findById(donation.volunteerId);
            donationObj.volunteerDetails = volunteer
              ? { name: volunteer.name, phone: volunteer.phone, location: volunteer.location, rating: volunteer.rating }
              : null;
          }

          if (donation.receiverId) {
            const receiverRequest = await Request.findById(donation.receiverId);
            if (receiverRequest) {
              donationObj.receiverDetails = {
                name: receiverRequest.receiverName,
                phone: receiverRequest.receiverPhone,
                address: receiverRequest.receiverAddress,
                location: receiverRequest.receiverLocation,
                quantity: receiverRequest.quantity,
              };
            } else {
              const activeOrganization = await User.findById(donation.receiverId);
              donationObj.receiverDetails = (activeOrganization && activeOrganization.isActive)
                ? { name: activeOrganization.name, phone: activeOrganization.phone, location: activeOrganization.location, role: activeOrganization.role }
                : null;
            }
          }
          return donationObj;
        })
    );

    return res.status(200).json({
      msg: "Fetched donations with required status",
      donations: matchedDonations,
    });
  } catch (err) {
    console.error("Error fetching donor donations:", err.message);
    res.status(500).json({ msg: "Error fetching donations", error: err.message });
  }
};

const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const donation = await Donation.findByIdAndUpdate(id, { status }, { new: true });

    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" });
    }

    res.status(200).json({ msg: "Donation status updated", donation });
  } catch (err) {
    res.status(500).json({ msg: "Error updating donation status", error: err.message });
  }
};

const markAsSelfVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findByIdAndUpdate(
      id,
      { status: "pickbydonor" },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" });
    }

    res.status(200).json({ msg: "Donation status updated to pickbydonor", donation });
  } catch (err) {
    res.status(500).json({ msg: "Error updating donation status", error: err.message });
  }
};

const donate = async (req, res) => {
  try {
    const { quantityDonated } = req.body;
    const { requestId } = req.params;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const remainingQuantity = request.quantity - quantityDonated;

    if (remainingQuantity > 0) {
      request.quantity = remainingQuantity;
      request.isActive = true;
      await request.save();
      return res.json({ message: "Donation successfully added", remainingQuantity });
    } else {
      request.quantity = 0;
      request.isActive = false;
      await request.save();
      return res.json({ message: "Donation fully completed, request closed", remainingQuantity: 0 });
    }
  } catch (error) {
    console.error("Error in donate:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getActiveRequests = async (req, res) => {
  try {
    const requests = await Request.find({ isActive: true });
    const organizations = await User.find({ role: "receiver", isActive: true });

    res.status(200).json({
      msg: "Retrieved Active requests successfully",
      requests,
      organizations,
    });
  } catch (error) {
    console.error("Error finding requests:", error);
    res.status(400).json({ msg: "Error finding requests", error: error.message });
  }
};

const requestVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findByIdAndUpdate(
      id,
      { needVolunteer: true },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    res.status(200).json({ message: "Request sent for volunteer.", donation });
  } catch (err) {
    console.error("Error sending volunteer request:", err);
    res.status(500).json({ error: err.message });
  }
};

const DonationPickedByVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findByIdAndUpdate(
      id,
      { status: "pickbyvolunteer", needVolunteer: false },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    res.status(200).json({ message: "Food picked successfully.", donation });
  } catch (err) {
    console.error("Error picking donation:", err);
    res.status(500).json({ error: err.message });
  }
};

const confirmDonationCompletion = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findByIdAndUpdate(
      id,
      { status: "completed" },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    res.status(200).json({ message: "Donation marked as completed.", donation });
  } catch (err) {
    console.error("Error completing donation:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  postDonation,
  deleteDonation,
  acceptDonation,
  getDonations,
  assignVolunteer,
  donarAccept,
  donate,
  updateDonationStatus,
  markAsSelfVolunteer,
  getActiveRequests,
  requestVolunteer,
  DonationPickedByVolunteer,
  confirmDonationCompletion,
};
