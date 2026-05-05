const mongoose = require("mongoose");
const User = require("../models/user.model");

const updateUser = async (req, res) => {
  const { name, phone, location } = req.body;
  try {
    if (!name && !phone && !location) {
      return res.status(401).json({ msg: "No changes provided for updation" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;

    const updatedUser = await user.save();
    res.status(200).json({ msg: "User successfully updated", updatedUser });
  } catch (error) {
    return res.status(400).json({ msg: "Failed to update user details", error: error.message });
  }
};

const getProfile = async (req, res) => {
  const userId = req.user.id;
  const objectId = new mongoose.Types.ObjectId(userId);

  try {
    const user = await User.findById(objectId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const abstractUser = {
      name: user.name,
      phone: user.phone,
      location: { ...user.location },
    };

    res.status(200).json({
      msg: "Retrieved user details successfully",
      user: abstractUser,
    });
  } catch (error) {
    res.status(500).json({ msg: "Failed to retrieve user details", error: error.message });
  }
};

module.exports = {
  updateUser,
  getProfile,
};
