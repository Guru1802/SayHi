/*
import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve()

// Middleware
app.use(express.json());
app.use(cookieParser());

// Allow both common Vite ports
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  })
}

// --- Socket.IO setup (THIS FIXES /socket.io 404) ---
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// (Optional but useful) keep track of online users
const userSocketMap = {}; // userId -> socketId

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  // send online users list to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`server is running on PORT:${PORT}`);
  connectDB();
});

// Export if other files need it
export { io, userSocketMap };
*/

import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// path.resolve() -> repo root on Render (/opt/render/project/src)
const __dirname = path.resolve();

// -------------------- Middleware --------------------
app.use(express.json());
app.use(cookieParser());

// Local dev origins only
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

// Enable CORS in development for Vite dev server.
// In production (Render), frontend is served by the same origin, so CORS is not needed.
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true,
    })
  );
}

// -------------------- API Routes --------------------
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// -------------------- Serve Frontend (Production) --------------------
if (process.env.NODE_ENV === "production") {
  // Linux is case-sensitive: Frontend != frontend
  const clientDistPath = path.join(__dirname, "..", "..", "Frontend", "dist");

  app.use(express.static(clientDistPath));

  // SPA fallback — avoids Express "*" route parsing issues
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// -------------------- Socket.IO --------------------
const server = http.createServer(app);

const io = new Server(server, {
  // For local dev, allow Vite origins. In production same-origin will work.
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Track online users
const userSocketMap = {}; // userId -> socketId

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// -------------------- Start Server --------------------
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

export { io, userSocketMap };
