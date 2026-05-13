const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Express backend is running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:3000",
    methods: ["GET", "POST"],
  },
});

const getConversationId = (uid1, uid2) => {
  return [uid1, uid2].sort().join("_");
};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinUserRoom", ({ currentUserId, selectedUserId }) => {
    const conversationId = getConversationId(currentUserId, selectedUserId);
    socket.join(conversationId);
    console.log(`${socket.id} joined room ${conversationId}`);
  });

  socket.on("sendPrivateMessage", (messageData) => {
    const conversationId = getConversationId(
      messageData.from,
      messageData.to
    );

    io.to(conversationId).emit("receivePrivateMessage", {
      ...messageData,
      conversationId,
      createdAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});