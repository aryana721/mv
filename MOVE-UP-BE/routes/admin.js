const express = require('express');
const User = require('../models/user'); // Assuming you have a User model defined
const auth = require('../middleware/Auth'); // Assuming you have an auth middleware for role-based access control
const router = express.Router();

router.get('/users', auth(['Admin']), async (req, res) => {
  const vendors = await User.find({ role: 'Vendor' });
  const drivers = await User.find({ role: 'Driver' });
  res.json({ vendors, drivers });
});

module.exports = router;