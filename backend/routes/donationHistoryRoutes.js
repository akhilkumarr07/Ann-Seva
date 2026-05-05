// routes/donationHistoryRoutes.js

const express = require("express");
const router = express.Router();
const {
  donorHistory,
  receiverHistory,
  volunteerHistory,
} = require("../controllers/donationHistoryController");

// Donor history route
router.get("/donor/history", donorHistory);

// Receiver history route
router.get("/receiver/history", receiverHistory);

// Volunteer history route
router.get("/volunteer/history", volunteerHistory);

module.exports = router;
