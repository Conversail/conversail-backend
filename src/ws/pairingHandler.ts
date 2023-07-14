import { type Server, type Socket } from "socket.io";
import rClient from "../redis";
import { getRoomAndReceiverId } from "../utils";
import { EventsFromClient, EventsToClient } from "../types";

export default function registerPairingHandler(io: Server, socket: Socket): void {
  const userId: string = socket.data.userId;

  socket.on(EventsFromClient.startPairing, async () => {
    const waitingUser = await rClient.sRandMember("pairing_waitlist");

    if (!waitingUser) return await rClient.sAdd("pairing_waitlist", userId);

    await rClient
      .multi()
      .sRem("pairing_waitlist", waitingUser)
      .set(`chat:${userId}_${waitingUser}:room`, 1)
      .exec();

    io.to([userId, waitingUser]).emit(EventsToClient.paired);
  });

  socket.on(EventsFromClient.cancelChatting, async () => {
    await rClient.sRem("pairing_waitlist", userId);
    io.to(userId).emit(EventsToClient.chatEnded);

    const { roomKey, receiverId } = await getRoomAndReceiverId(userId);

    io.to(receiverId).emit(EventsToClient.chatEnded);
    if (roomKey) await rClient.del(roomKey);
  });

  socket.on("disconnect", async () => {
    await rClient.del(`online_user:${userId}`);
    await rClient.sRem("pairing_waitlist", userId);
    const { roomKey, receiverId } = await getRoomAndReceiverId(userId);

    io.to(receiverId).emit(EventsToClient.chatEnded);

    if (roomKey) await rClient.del(roomKey);
  });
}
