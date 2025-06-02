const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const vendorRoutes = require('./routes/vendor');
const driverRoutes = require('./routes/driver');
const { handleDriverSocket } = require('./sockets/driverSocket');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/vendor', vendorRoutes);
app.use('/driver', driverRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to MOVE-UP Backend API');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
// Sockets
io.on('connection', (socket) => {
  handleDriverSocket(socket, io);
});
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; 
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
