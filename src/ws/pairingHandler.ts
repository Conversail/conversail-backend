import { Server, Socket } from "socket.io";
import rClient from "../redis";
import { getRoomAndReceiverId } from "../utils";

export default function registerPairingHandler(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  socket.on("pair", async () => {
    const waitingUser = await rClient.sRandMember("pairing_waitlist");

    if (!waitingUser) return await rClient.sAdd("pairing_waitlist", userId);

    await rClient
      .multi()
      .sRem("pairing_waitlist", waitingUser)
      .set(`chat:${userId}_${waitingUser}:room`, 1)
      .exec();

    io.to([userId, waitingUser]).emit("paired");
  });

  socket.on("cancel chatting", async () => {
    await rClient.sRem("pairing_waitlist", userId);
    io.to(userId).emit("chat ended");

    const { roomKey, receiverId } = await getRoomAndReceiverId(userId);

    io.to(receiverId).emit("chat ended");
    if (roomKey) await rClient.del(roomKey);
  });
}
