import { type Server, type Socket } from "socket.io";
import rClient from "../cache/redis";
import { EventsFromClient, EventsToClient, type Message } from "../types";
import { randomUUID } from "crypto";
import { getRoomAndReceiverId } from "../cache/utils";

export default function registerChattingHandler(io: Server, socket: Socket): void {
  const userId = socket.data.userId;

  socket.on(EventsFromClient.sendMessage, async ({ content, replyTo, createdAt }, ack) => {
    const { roomKey, receiverId } = await getRoomAndReceiverId(userId);

    if (!roomKey || !receiverId) return;

    const messageId = randomUUID();

    const messageKey = `${roomKey}:message:${messageId}`;

    await rClient
      .multi()
      .hSet(messageKey, "content", content)
      .hSet(messageKey, "replyTo", replyTo ?? 0)
      .hSet(messageKey, "createdAt", createdAt)
      .hSet(messageKey, "sender", userId)
      .hSet(messageKey, "receiver", receiverId)
      .exec();

    io.to(receiverId).emit(EventsToClient.incomingMessage, {
      id: messageId,
      content,
      replyTo,
      createdAt,
      fromYourself: false
    } satisfies Message);

    ack(messageId);
  });

  socket.on(EventsFromClient.startedTyping, async () => {
    const { roomKey, receiverId } = await getRoomAndReceiverId(userId);

    if (!roomKey || !receiverId) return;

    io.to(receiverId).emit(EventsToClient.startedTyping);
  });

  socket.on(EventsFromClient.stoppedTyping, async () => {
    const { roomKey, receiverId } = await getRoomAndReceiverId(userId);

    if (!roomKey || !receiverId) return;

    io.to(receiverId).emit(EventsToClient.stoppedTyping);
  });

  socket.on(EventsFromClient.reportMate, async () => {
    await rClient.sRem("pairing_waitlist", userId);
    io.to(userId).emit(EventsToClient.chatEnded);

    const { roomKey, receiverId } = await getRoomAndReceiverId(userId);

    io.to(receiverId).emit(EventsToClient.chatEnded);
    if (roomKey) await rClient.del(roomKey);
  });
}
