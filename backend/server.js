const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db"); // Assuming db connection logic is moved here

// Import routes
const userRoutes = require("./routes/userRoutes");
const pollRoutes = require("./routes/pollRoutes");
const commentRoutes = require("./routes/commentRoutes"); // Single router export now

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json()); // Body parser for JSON

// Serve static files (like uploaded profile pictures)
// Make sure the /uploads directory exists or is created
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Mount Routes
app.use("/api/users", userRoutes);
app.use("/api/polls", pollRoutes);
// Mount comment routes under /api/polls/:pollId/comments AND /api/comments for replies
app.use("/api/polls/:pollId/comments", commentRoutes); // Handles GET / and POST /
app.use("/api/comments", commentRoutes); // Handles POST /reply/:commentId

// Basic route for testing
app.get("/api", (req, res) => {
  res.send("API is running...");
});

// Error Handling Middleware (Example - implement more robustly as needed)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Make sure CLIENT_URL is correct in your environment file
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"], // Include any custom headers you might be sending
  },
});

// Make io accessible in request object (for controllers)
app.set("socketio", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join_poll", (pollId) => {
    socket.join(pollId);
    console.log(`Socket ${socket.id} joined room ${pollId}`);
  });

  socket.on("leave_poll", (pollId) => {
    socket.leave(pollId);
    console.log(`Socket ${socket.id} left room ${pollId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
