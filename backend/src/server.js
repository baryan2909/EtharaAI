const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// Wrap express app in http server
const server = http.createServer(app);

// Initialize socket.io with robust CORS options
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Bind io to express app instance for controller accessibility
app.set('io', io);

// Configure socket communication logic
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Client subscribes to a specific project workspace room
  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    console.log(`Socket client ${socket.id} joined project room: ${projectId}`);
  });

  // Client unsubscribes from a project workspace room
  socket.on('leave_project', (projectId) => {
    socket.leave(projectId);
    console.log(`Socket client ${socket.id} left project room: ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Start listening
const serverListener = server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  serverListener.close(() => process.exit(1));
});
