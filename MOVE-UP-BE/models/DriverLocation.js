const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: String,
  to: String,
  fromCoords: [Number], // [lat, lng]
  toCoords: [Number],   // [lat, lng]
  route: [[Number]],    // [[lat, lng], [lat, lng], ...]
  startedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Route', routeSchema);
