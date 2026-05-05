const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  postDonation,
  deleteDonation,
  acceptDonation,
  assignVolunteer,
  getDonations,
  donarAccept,
  donate,
  updateDonationStatus,
  markAsSelfVolunteer,
  getActiveRequests,
  requestVolunteer,
  DonationPickedByVolunteer,
  confirmDonationCompletion,
} = require("../controllers/donation.controller");
const router = express.Router();

const upload = require('../utils/multerconfig')

router.get("/getDonations", getActiveRequests);

// for posting a donation in donor page
router.post("/", upload.single("donationPicture"), postDonation);

// for deleting donation when receiver declines the donation
router.delete("/:id", deleteDonation);

// receriver accepting the donation
router.put("/accept/:id", acceptDonation);

// if both donor and receiver request volunteer, and volunteer accepts or declines the donation
router.put("/volunteer/:id", assignVolunteer);

// for showing all the donations requiring a volunteer, to volunteer
router.get("/volunteer", getDonations);


router.get("/", donarAccept);

// Update donation status route
router.patch('/:id/status', updateDonationStatus);
// Mark as self volunteer route by donor updates as pickbydonor
router.patch('/donation/:id/self-volunteer', markAsSelfVolunteer);

//confirm status has completed by donar(food accepted by volunteer) when volunter had came  to donar (pick by receiver ==>  fulfilled)
//router.patch('/:id/confirm', confirmPickup);

//donar requires a volunteer ==> needvolunteer : true
//router.patch("/need-volunteer/:id",needVolunteer)

router.put('/donate/:requestId', donate);



//donar requires a volunteer ==> needvolunteer : true
router.patch("/need-volunteer/:id",requestVolunteer)
// Mark as picked by volunteer
router.patch("/:id/pick-food", DonationPickedByVolunteer);

// Mark as completed
router.patch("/:id/complete", confirmDonationCompletion);

module.exports = router;
