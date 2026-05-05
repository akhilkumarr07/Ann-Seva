require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const User = require('./models/user.model');
const Donation = require('./models/donation.model');
const Request = require('./models/request.model');
const Notification = require('./models/notification.model');

const wipeData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB for data wiping...");

        console.log("Deleting all Users...");
        await User.deleteMany({});
        
        console.log("Deleting all Donations...");
        await Donation.deleteMany({});
        
        console.log("Deleting all Requests...");
        await Request.deleteMany({});

        console.log("Deleting all Notifications...");
        await Notification.deleteMany({});

        console.log("All registered users and their related data have been completely deleted.");
        process.exit(0);
    } catch (error) {
        console.error("Wipe data error:", error.message);
        process.exit(1);
    }
};

wipeData();
