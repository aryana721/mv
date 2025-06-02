
const express = require('express');
const router = express.Router();
const Route = require('../models/DriverLocation');

router.get('/:driverId/:routeId/route', async (req, res) => {
  const route = await Route.findOne({
    driverId: req.params.driverId,
    _id: req.params.routeId
  });

  if (!route) return res.status(404).json({ error: 'No route found' });

  res.json({
    route: route.route,
    fromCoords: route.fromCoords,
    toCoords: route.toCoords
  });
});

// GET /api/routes/driver/:driverId
router.get('/driver/:driverId', async (req, res) => {
  const routes = await Route.find({ driverId: req.params.driverId });
  res.json(routes);
});





module.exports = router;