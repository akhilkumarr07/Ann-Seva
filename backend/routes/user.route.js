const express = require("express");
const router = express.Router();

const { updateUser, getProfile } = require("../controllers/user.controller");

// Profile update
router.put("/", updateUser);

// Get user profile
router.get("/profile", getProfile);

module.exports = router;