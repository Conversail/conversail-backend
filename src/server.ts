import express from "express";
import { Server } from "socket.io";
import http from "http";
import { randomUUID } from "crypto";
import registerPairingHandler from "./ws/pairingHandler";
import { User } from "./types";
import rClient from "./redis";
import registerChattingHandler from "./ws/chattingHandler";
import { getRoomAndReceiverId } from "./utils";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {},
});

io.on("connection", async (socket) => {
  const user: User = {
    id: randomUUID(),
    ipAddress: socket.handshake.address,
  };

  socket.data.userId = user.id;
  socket.join(user.id);
  await rClient.hSet(`online_user:${user.id}`, "ipAddress", user.ipAddress);

  registerPairingHandler(io, socket);
  registerChattingHandler(io, socket);

  socket.on("disconnect", async () => {
    await rClient.del(`online_user:${user.id}`);
    await rClient.sRem("pairing_waitlist", user.id);
    const { roomKey, receiverId } = await getRoomAndReceiverId(user.id);

    io.to(receiverId).emit("chat ended");

    if (roomKey) await rClient.del(roomKey);
  });
});

export default server;
