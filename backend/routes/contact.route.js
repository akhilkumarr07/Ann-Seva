const express = require("express");
const {
  postContactForm,
  getContacts,
} = require("../controllers/contact.controller");

const router = express.Router();

router.post("/", postContactForm);
router.get("/", getContacts);

module.exports = router;
