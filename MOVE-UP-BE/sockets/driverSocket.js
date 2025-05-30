const Route = require('../models/DriverLocation');

function handleDriverSocket(socket, io) {
  socket.on('joinRoom', (driverId) => {
    socket.join(`driver-${driverId}`);
  });

socket.on('start-route', async ({ driverId, from, to, fromCoords, toCoords }) => {
  console.log(driverId, from, to, fromCoords, toCoords);
  const newRoute = new Route({
    driverId,
    from,
    to,
    fromCoords,
    toCoords,
    route: [] // will be filled by `location-update`
  });
  await newRoute.save();
});

socket.on('location-update', async ({ driverId, coords }) => {
  const latestRoute = await Route.findOne({ driverId }).sort({ startedAt: -1 });

  if (latestRoute) {
    latestRoute.route.push(coords);
    await latestRoute.save();

    // Broadcast to admin/vendor viewers
    io.to(driverId.toString()).emit('location-update', { driverId, coords });
  }
});

}

module.exports = { handleDriverSocket };