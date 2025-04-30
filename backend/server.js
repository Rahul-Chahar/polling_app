const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db"); 

const userRoutes = require("./routes/userRoutes");
const pollRoutes = require("./routes/pollRoutes");
const commentRoutes = require("./routes/commentRoutes"); 


dotenv.config();

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json()); 


app.use("/uploads", express.static(path.join(__dirname, "/uploads")));


app.use("/api/users", userRoutes);
app.use("/api/polls", pollRoutes);

app.use("/api/polls/:pollId/comments", commentRoutes);
app.use("/api/comments", commentRoutes);


app.get("/api", (req, res) => {
  res.send("API is running...");
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://your-vercel-app.vercel.app",  
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"], 
    credentials: true,

  },
});


app.set("socketio", io);

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
