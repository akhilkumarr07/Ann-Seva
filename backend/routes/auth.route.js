const express = require('express');
const { registerHandler, loginHandler } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);

module.exports = router;
