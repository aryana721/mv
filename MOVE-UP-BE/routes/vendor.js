const express = require('express');
const AssignedDriver = require('../models/AssignedDriver');
const auth = require('../middleware/Auth'); // Assuming you have an auth middleware for role-based access control
const User = require('../models/user'); // Assuming you have a User model defined
const router = express.Router();

router.post('/assign-driver', auth(['Vendor']), async (req, res) => {
  const { driverId } = req.body;
  await AssignedDriver.create({ vendorId: req.user.id, driverId });
  res.json({ message: 'Driver assigned' });
});
router.get('/assign-driver', auth(['Vendor']), async (req, res) => {
  const drivers = await AssignedDriver.find({ vendorId: req.user.id }).populate('driverId');
});

router.get('/drivers', auth(['Vendor','Admin']), async (req, res) => {
  const assignments = await AssignedDriver.find({ vendorId: req.user.id }).populate('driverId');
  res.json(assignments.map(a => a.driverId));
});

module.exports = router;