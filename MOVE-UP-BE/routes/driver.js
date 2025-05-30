
const express = require('express');
const router = express.Router();
const DriverLocation = require('../models/DriverLocation');

router.get('/:driverId/route', async (req, res) => {
  const route = await DriverLocation.findOne({ driverId: req.params.driverId }).sort({ startedAt: -1 });

  if (!route) return res.status(404).json({ error: 'No route found' });

  res.json({
    route: route.route,
    fromCoords: route.fromCoords,
    toCoords: route.toCoords
  });
});

module.exports = router;