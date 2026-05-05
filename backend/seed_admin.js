const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user.model");
require("dotenv").config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const hash = await bcrypt.hash("Abhi.242", 10);
    
    // Remove existing admin
    await User.deleteMany({ role: "admin" });
    
    // Create new admin
    await User.create({
      name: "Abhinav Kumar",
      phone: "Abhi242",
      password: hash,
      email: "admin@annseva.com",
      role: "admin",
      isAdmin: true,
      location: { landmark: "HQ", lat: 0, long: 0 }
    });
    
    console.log("Creator Admin seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding Admin:", error);
    process.exit(1);
  }
}

seed();
