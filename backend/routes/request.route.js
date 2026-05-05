const express = require("express");
const router = express.Router();
const {
  acceptDonation,
  getActiveRequests,
  deletedRequest,
  postRequest,
  getActiveDonation,
  rejectDonation,
  completeDonation,
  cancelRequest,
} = require("../controllers/request.controller");


// Display all the active requests and organizations to the donor
router.get("/", getActiveRequests);

// Receiver making a request
router.post("/", postRequest);

// Receiver accepting a donation
router.post("/accept", acceptDonation);

// Fetch active donation details for a receiver
router.get("/getDonation", getActiveDonation);

// When receiver decides to stop a particular request
router.delete("/:id", deletedRequest);

router.post("/reject", rejectDonation);

router.post("/completed",completeDonation);

router.post("/cancel", cancelRequest);

module.exports = router;
