import express from "express";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import axios from "axios";
dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
  },
});

io.on("connection", (socket) => {
  console.log("user connected ", socket.id);

  //   use for make user online
  socket.on("identity", async (userId) => {
    console.log("userId: ", userId);
    try {
      await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`, {
        userId: userId,
        socketId: socket.id,
      });
    } catch (error) {
      console.log(error);
    }
  });

  //   for update user location
  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    console.log("userId: ", userId);
    console.log("latitude: ", latitude);
    console.log("longitude: ", longitude);

    const location = [longitude, latitude];
    try {
      await axios.post(
        `${process.env.NEXT_BASE_URL}/api/socket/update-location`,
        {
          userId: userId,
          location: location,
        },
      );
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected ", socket.id);
  });
});

app.post("/notify", async (req, res) => {
  const { socketId, event, data } = req.body;

  if (socketId) {
    io.to(socketId).emit(event, data);
  } else {
    io.emit(event, data);
  }

  return res.status(200).json({ success: true });
});

server.listen(port, () => {
  console.log(`Server started port at: ${port}`);
});
