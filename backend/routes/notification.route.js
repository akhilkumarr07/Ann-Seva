const express = require("express");
const { getNotifications, markAsRead } = require("../controllers/notification.controller");

const router = express.Router();

router.get("/", getNotifications);
router.put("/:id/read", markAsRead);

module.exports = router;
