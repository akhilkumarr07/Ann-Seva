const Donation = require("../models/donation.model");
const User = require("../models/user.model");
const Request = require("../models/request.model");

// Returns aggregate counts for the home page stats
const getMetrics = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Pie chart: Status distribution
    const statusCounts = await Donation.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Line chart: Donations over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const donationsPerDay = await Donation.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      totalDonations,
      totalRequests,
      totalUsers,
      statusCounts,
      donationsPerDay
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ message: "Error fetching metrics" });
  }
};

module.exports = { getMetrics };
