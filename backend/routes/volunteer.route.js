
const express = require("express");
const router = express.Router();

const {volunteer,getCurrentAcceptedDonation,acceptDonationByVolunteer,DonationPickedByVolunteer} = require("../controllers/volunteer.controller.js");

router.get("/", volunteer);

router.patch("/accept/:id", acceptDonationByVolunteer);

router.get("/accepteddonations", getCurrentAcceptedDonation)

//when volnteer picks food from donor =>pickbyvolnteer(done by volunteer)
router.patch("/pickedfood/:id", DonationPickedByVolunteer);
module.exports = router;