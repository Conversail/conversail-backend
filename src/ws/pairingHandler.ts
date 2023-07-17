import { type Server, type Socket } from "socket.io";
import rClient from "../cache/redis";
import { getRoomAndReceiverId, handleFinishedChat } from "../cache/utils";
import { EventsFromClient, EventsToClient } from "../types";
import { randomUUID } from "crypto";

export default function registerPairingHandler(io: Server, socket: Socket): void {
  const connectionId: string = socket.data.connectionId;

  socket.on(EventsFromClient.startPairing, async () => {
    handleFinishedChat(connectionId);
    const raffledConnectionId = await rClient.sRandMember("pairing_waitlist");

    if (!raffledConnectionId) return await rClient.sAdd("pairing_waitlist", connectionId);

    const connectionIds = [raffledConnectionId, connectionId];
    connectionIds.sort();

    await rClient
      .multi()
      .sRem("pairing_waitlist", raffledConnectionId)
      .set(`chat:${connectionIds.join("_")}:room`, randomUUID())
      .exec();

    io.to([connectionId, raffledConnectionId]).emit(EventsToClient.paired);
  });

  socket.on(EventsFromClient.cancelChatting, async () => {
    await rClient.sRem("pairing_waitlist", connectionId);
    io.to(connectionId).emit(EventsToClient.chatEnded);

    const { receiverId } = await getRoomAndReceiverId(connectionId);

    io.to(receiverId).emit(EventsToClient.chatEnded);
  });

  socket.on("disconnect", async () => {
    await rClient.sRem("pairing_waitlist", connectionId);
    const { receiverId } = await getRoomAndReceiverId(connectionId);

    io.to(receiverId).emit(EventsToClient.chatEnded);

    await handleFinishedChat(connectionId);
    await rClient.del(`connection:${connectionId}`);
  });
}
