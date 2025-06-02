const Route = require('../models/DriverLocation');

function handleDriverSocket(socket, io) {
  socket.on('joinRoom', (driverId) => {
    socket.join(`driver-${driverId}`);
  });

  socket.on('join-route', ({ driverId, routeId }) => {
    socket.join(routeId);
  });

  socket.on('leave-route', ({ driverId, routeId }) => {
    socket.leave(routeId);
  });

  socket.on('start-route', async ({ driverId, from, to, fromCoords, toCoords }) => {
    const newRoute = new Route({
      driverId,
      from,
      to,
      fromCoords,
      toCoords,
      route: [],
    });
    await newRoute.save();
    io.to(`driver-${driverId}`).emit('route-created', newRoute);
  });


  socket.on('location-update', async ({ driverId, coords ,routeId}) => {
    const route = await Route.findById(routeId);
    console.log(route, coords);
  if (
    route &&
    Array.isArray(coords) &&
    typeof coords[0] === 'number' &&
    typeof coords[1] === 'number'
  ) {
    route.route.push(coords); // ✅ push array
    await route.save();

    io.to(driverId.toString()).emit('location-update', { driverId, coords, routeId: route._id });
  }
});

socket.on('get-latest-location', async ({ driverId, routeId }) => {
  try {
    const route = await Route.findById(routeId);
    if (route && route.route.length > 0) {
      const latestCoords = route.route[route.route.length - 1];
      socket.emit('location-update', {
        driverId,
        coords: latestCoords,
        routeId
      });
    }
  } catch (err) {
    console.error('Error sending latest location:', err);
  }
});


}

module.exports = { handleDriverSocket };
