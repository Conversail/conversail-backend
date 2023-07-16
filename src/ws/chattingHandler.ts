import { type Server, type Socket } from "socket.io";
import rClient from "../cache/redis";
import { EventsFromClient, EventsToClient, type Message, type ChatPreferences } from "../types";
import { randomUUID } from "crypto";
import { createReport, getRoomAndReceiverId } from "../cache/utils";

export default function registerChattingHandler(io: Server, socket: Socket): void {
  const connectionId = socket.data.connectionId;

  socket.on(EventsFromClient.sendMessage, async ({ content, replyTo, createdAt }, ack) => {
    const { roomKey, receiverId } = await getRoomAndReceiverId(connectionId);

    if (!roomKey || !receiverId) return;

    const messageId = randomUUID();

    const messageKey = `${roomKey}:message:${messageId}`;

    await rClient.hSet(messageKey, { content, replyTo: replyTo ? 1 : 0, createdAt, sender: connectionId, receiver: receiverId });

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
    const { roomKey, receiverId } = await getRoomAndReceiverId(connectionId);

    if (!roomKey || !receiverId) return;

    io.to(receiverId).emit(EventsToClient.startedTyping);
  });

  socket.on(EventsFromClient.stoppedTyping, async () => {
    const { roomKey, receiverId } = await getRoomAndReceiverId(connectionId);

    if (!roomKey || !receiverId) return;

    io.to(receiverId).emit(EventsToClient.stoppedTyping);
  });

  socket.on(EventsFromClient.reportMate, async ({ reason }) => {
    io.to(connectionId).emit(EventsToClient.chatEnded);

    const { receiverId } = await getRoomAndReceiverId(connectionId);

    io.to(receiverId).emit(EventsToClient.chatEnded);

    createReport({ reason, authorId: connectionId });
  });

  socket.on(EventsFromClient.updateChatPreferences, async ({ pairingLanguage, allowImages, allowVoiceMessages }: ChatPreferences) => {
    const { receiverId } = await getRoomAndReceiverId(connectionId);

    await rClient.multi()
      .hSet(`connection:${receiverId}`, "chatPreferences:pairingLanguage", pairingLanguage)
      .hSet(`connection:${receiverId}`, "chatPreferences:allowImages", allowImages ? 1 : 0)
      .hSet(`connection:${receiverId}`, "chatPreferences:allowVoiceMessages", allowVoiceMessages ? 1 : 0)
      .exec();

    io.to(receiverId).emit(EventsToClient.updatedChatPreferences, { pairingLanguage, allowImages, allowVoiceMessages });
  });
}
