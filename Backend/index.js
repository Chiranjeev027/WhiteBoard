// Backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Canvas = require('./models/canvasModel');
const User = require('./models/userModel');

// Database connection
const connectToDatabase = require('./db');
connectToDatabase();

const app = express();
const server = http.createServer(app);

// WebSocket Server Configuration
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production to your frontend URL
  },
});

// Track connected users
const connectedUsers = new Map(); // userId -> socketId

// Express middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  next();
});

// Routes (no longer have access to io/connectedUsers)
app.use('/users', require('./routes/userRoute'));
app.use('/canvas', require('./routes/canvasRoute'));

// WebSocket Connection Handling
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  // --- Authentication Middleware ---
  socket.use(([event, ...args], next) => {
    // Allow authentication events without token
    if (event === 'authenticate') return next();
    
    // Block other events until authenticated
    if (!socket.userId) {
      const err = new Error("Unauthorized: authenticate first");
      console.error("Blocked unauthorized event:", event);
      return next(err);
    }
    next();
  });

  // Authenticate user and track connection
  socket.on("authenticate", async (token) => {
    try {
        if (!token) throw new Error("JWT must be provided");

        // Decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded); // Debug log

        // Find user by EMAIL (not ID)
        const user = await User.findOne({ email: decoded.email });
        console.log("Found user:", user); // Debug log

        if (!user) throw new Error("User not found");

        // Store user info on socket
        socket.userId = user._id.toString();
        socket.email = user.email;

        // Track connected users
        connectedUsers.set(user._id.toString(), socket.id);
        console.log(`🔑 User ${user.email} authenticated (Socket: ${socket.id})`);

        socket.emit("authenticationSuccess", { userId: user._id });
    } catch (error) {
        console.error("❌ Authentication error:", error.message);
        socket.emit("authenticationError", { message: error.message });
        socket.disconnect();
    }
    });

  // Handle canvas joining
  socket.on("joinCanvas", async (data) => {
    try {
      const { canvasId } = data;
      const user = await User.findById(socket.userId);
      if (!user) throw new Error("User not found");

      // Verify canvas access
      const canvas = await Canvas.findOne({
        _id: canvasId,
        $or: [{ owner: user._id }, { sharedWith: user._id }]
      });

      if (!canvas) throw new Error("Canvas not found or access denied");

      // Join the canvas room
      socket.join(canvasId);
      console.log(`🎨 User ${user.email} joined canvas ${canvasId}`);

      // Send current canvas state
    //   socket.emit("loadCanvas", canvas);
    socket.emit("loadCanvas", { 
      _id: canvas._id,
      elements: canvas.elements || [], // Ensure elements exist
      name: canvas.name,
      owner: canvas.owner,
      sharedWith: canvas.sharedWith || []
    });

      // Notify others in the room
      socket.to(canvasId).emit("userJoined", {
        userId: user._id,
        email: user.email
      });
    } catch (error) {
      console.error("Join canvas error:", error.message);
      socket.emit("canvasError", { message: error.message });
    }
  });

  // Handle canvas updates
  socket.on("canvasUpdate", async (data) => {
    try {
      const { canvasId, elements } = data;
      const user = await User.findById(socket.userId);

      // Verify canvas access
      const canvas = await Canvas.findOne({
        _id: canvasId,
        $or: [{ owner: user._id }, { sharedWith: user._id }]
      });

      if (!canvas) throw new Error("Canvas not found or access denied");

      // Update canvas in database
      const updatedCanvas = await Canvas.findByIdAndUpdate(
        canvasId,
        { elements },
        { new: true }
      );

      // Broadcast update to all users in the room
      io.to(canvasId).emit("canvasUpdate", updatedCanvas);
    } catch (error) {
      console.error("Canvas update error:", error.message);
      socket.emit("canvasUpdateError", { message: error.message });
    }
  });

  // Handle sharing notifications
  socket.on("notifyShare", (data) => {
    try {
      const { targetUserId, canvasId, canvasName } = data;
      
      if (connectedUsers.has(targetUserId)) {
        const targetSocketId = connectedUsers.get(targetUserId);
        io.to(targetSocketId).emit("canvasShared", {
          canvasId,
          canvasName,
          sharedAt: new Date()
        });
      }
    } catch (error) {
      console.error("Notify share error:", error.message);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove from connected users
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`❌ User ${socket.userId} disconnected`);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`🟢 Server running on http://localhost:${PORT}`);
});