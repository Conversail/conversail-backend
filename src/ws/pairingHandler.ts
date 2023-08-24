import { type Server, type Socket } from "socket.io";
import rClient from "../cache/redis";
import { getRoomAndReceiverId, handleFinishedChat, removeFromWaitlist } from "../cache/utils";
import { EventsFromClient, EventsToClient } from "../types";
import { randomUUID } from "crypto";

export default function registerPairingHandler(io: Server, socket: Socket): void {
  const connectionId: string = socket.data.connectionId;

  socket.on(EventsFromClient.startPairing, async () => {
    handleFinishedChat(connectionId);
    const pairingLanguage = await rClient.hGet(`connection:${connectionId}`, "chatPreferences:pairingLanguage");

    const raffledConnectionId = await rClient.sRandMember(`pairing_waitlist:${pairingLanguage}`);

    if (!raffledConnectionId) return await rClient.sAdd(`pairing_waitlist:${pairingLanguage}`, connectionId);

    const connectionIds = [raffledConnectionId, connectionId];
    connectionIds.sort();

    const removedFromWaitlist1 = await removeFromWaitlist(connectionId);
    const removedFromWaitlist2 = await removeFromWaitlist(raffledConnectionId);

    if (!(removedFromWaitlist1 && removedFromWaitlist2)) return;

    await rClient
      .multi()
      .set(`chat:${connectionIds.join("_")}:room`, randomUUID())
      .exec();

    io.to([connectionId, raffledConnectionId]).emit(EventsToClient.paired);
  });

  socket.on(EventsFromClient.cancelChatting, async () => {
    const removedFromWaitlist = await removeFromWaitlist(connectionId);

    if (!removedFromWaitlist) return;

    io.to(connectionId).emit(EventsToClient.chatEnded);

    const { receiverId } = await getRoomAndReceiverId(connectionId);

    io.to(receiverId).emit(EventsToClient.chatEnded);
  });

  socket.on("disconnect", async () => {
    const removedFromWaitlist = await removeFromWaitlist(connectionId);

    if (!removedFromWaitlist) return;

    const { receiverId } = await getRoomAndReceiverId(connectionId);

    io.to(receiverId).emit(EventsToClient.chatEnded);

    await handleFinishedChat(connectionId);
    await rClient.del(`connection:${connectionId}`);
  });
}
