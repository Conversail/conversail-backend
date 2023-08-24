import { type Connection } from "../types";
import { randomUUID } from "crypto";
import rClient from "../cache/redis";
import registerChattingHandler from "../ws/chattingHandler";
import registerPairingHandler from "../ws/pairingHandler";
import { type Server, type Socket } from "socket.io";

export default async function connectionHandler(io: Server, socket: Socket): Promise<void> {
  const { pairingLanguage, allowImages, allowVoiceMessages } = socket.handshake.query;

  const connection: Connection = {
    id: randomUUID(),
    ipAddress: socket.handshake.address,
    createdAt: new Date(),
    chatPreferences: {
      id: randomUUID(),
      createdAt: new Date(),
      pairingLanguage: pairingLanguage as string ?? "en",
      allowImages: allowImages === "true",
      allowVoiceMessages: allowVoiceMessages === "true"
    }
  };

  socket.data.connectionId = connection.id;
  socket.join(connection.id);
  await rClient.hSet(`connection:${connection.id}`, {
    ipAddress: connection.ipAddress,
    createdAt: connection.createdAt.getTime(),
    "chatPreferences:id": connection.chatPreferences.id,
    "chatPreferences:createdAt": connection.chatPreferences.createdAt.getTime(),
    "chatPreferences:pairingLanguage": connection.chatPreferences.pairingLanguage,
    "chatPreferences:allowImages": connection.chatPreferences.allowImages ? 1 : 0,
    "chatPreferences:allowVoiceMessages": connection.chatPreferences.allowVoiceMessages ? 1 : 0
  });

  registerPairingHandler(io, socket);
  registerChattingHandler(io, socket);
}
