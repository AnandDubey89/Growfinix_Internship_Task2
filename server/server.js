const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Receive and broadcast messages
    socket.on("send_message", (message) => {
        io.emit("receive_message", message);
    });

    // Typing indicator
    socket.on("typing", () => {
        socket.broadcast.emit("user_typing");
    });

    // Stop typing indicator
    socket.on("stop_typing", () => {
        socket.broadcast.emit("user_stop_typing");
    });

    // User disconnected
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

app.get("/", (req, res) => {
    res.send("Real-Time Chat Server is running!");
});

server.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});