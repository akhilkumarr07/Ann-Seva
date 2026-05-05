const Contact = require('../models/contact.model');

// Post a new contact form
async function postContactForm(req, res) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields (name, email, subject, message) are required" });
    }

    const newContact = new Contact({ name, email, subject, message });
    const savedContact = await newContact.save();

    res.status(201).json(savedContact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get all contacts
async function getContacts(req, res) {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { postContactForm, getContacts };