const express = require('express');
const AssignedDriver = require('../models/AssignedDriver');
const auth = require('../middleware/Auth'); // Assuming you have an auth middleware for role-based access control
const User = require('../models/user'); // Assuming you have a User model defined
const router = express.Router();
const Route = require('../models/DriverLocation');
const mongoose = require('mongoose');

router.post('/assign-driver', auth(['Vendor']), async (req, res) => {
  const { driverId } = req.body;
  await AssignedDriver.create({ vendorId: req.user.id, driverId });
  res.json({ message: 'Driver assigned' });
});
router.get('/assign-driver', auth(['Vendor']), async (req, res) => {
  const drivers = await AssignedDriver.find({ vendorId: req.user.id }).populate('driverId');
});

// GET /assigned-drivers/routes
router.get('/assigned-drivers/routes', auth(['Vendor']), async (req, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.user.id); // ✅ Fix here
    console.log('Fetching assigned driver routes for vendor:', vendorId);

    // Now this will work
    const assignedDrivers = await User.find({ vendorId, role: 'Driver' });
    console.log('Assigned drivers:', assignedDrivers);
    const driverIds = assignedDrivers.map(d => d._id);

    if (driverIds.length === 0) {
      return res.json([]); // No drivers assigned
    }

    // Step 2: Get all routes by these drivers
    const routes = await Route.find({ driverId: { $in: driverIds } }).sort({ createdAt: -1 });

    // Step 3: Merge routes into each driver
    const driversWithRoutes = assignedDrivers.map(driver => {
      const driverRoutes = routes.filter(route => route.driverId.toString() === driver._id.toString());
      return {
        _id: driver._id,
        name: driver.name,
        email: driver.email,
        routes: driverRoutes
      };
    });
    console.log('Assigned drivers with routes:', driversWithRoutes);
    res.json(driversWithRoutes);
  } catch (err) {
    console.error('Error fetching assigned driver routes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/drivers', auth(['Admin']), async (req, res) => {
  try {
    const drivers = await User.find({ role: 'Driver' }).select('name email _id');

    const driversWithRoutes = await Promise.all(
      drivers.map(async (driver) => {
        const routes = await Route.find({ driverId: driver._id });
        return {
          ...driver.toObject(),
          routes,
        };
      })
    );

    res.json(driversWithRoutes);
  } catch (err) {
    console.error('Error fetching drivers with routes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;