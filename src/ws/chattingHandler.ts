import { Server, Socket } from "socket.io";
import rClient from "../redis";
import { Message } from "../types";
import { randomUUID } from "crypto";
import { getRoomAndReceiverId } from "../utils";

export default function registerChattingHandler(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  socket.on("message", async ({ content, replyTo, sentAt }, ack) => {
    const { roomKey, receiverId } = await getRoomAndReceiverId(userId);

    if (!roomKey || !receiverId) return;

    const messageId = randomUUID();

    await rClient
      .multi()
      .hSet(`${roomKey}:message:${messageId}`, "content", content)
      .hSet(`${roomKey}:message:${messageId}`, "replyTo", replyTo ?? 0)
      .hSet(`${roomKey}:message:${messageId}`, "sentAt", sentAt)
      .hSet(`${roomKey}:message:${messageId}`, "sender", userId)
      .hSet(`${roomKey}:message:${messageId}`, "receiver", receiverId)
      .exec();

    io.to(receiverId).emit("message", {
      id: messageId,
      content,
      replyTo,
      sentAt,
      fromYourself: false,
    } as Message);

    ack(messageId);
  });

  socket.on("typing", async () => {
    const { roomKey, receiverId } = await getRoomAndReceiverId(userId);

    if (!roomKey || !receiverId) return;

    io.to(receiverId).emit("typing");
  });

  socket.on("stop typing", async () => {
    const { roomKey, receiverId } = await getRoomAndReceiverId(userId);

    if (!roomKey || !receiverId) return;

    io.to(receiverId).emit("stop typing");
  });
}
