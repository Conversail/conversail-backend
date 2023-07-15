import { type User } from "../types";
import { randomUUID } from "crypto";
import rClient from "../cache/redis";
import registerChattingHandler from "../ws/chattingHandler";
import registerPairingHandler from "../ws/pairingHandler";
import { type Server, type Socket } from "socket.io";

export default async function connectionHandler(io: Server, socket: Socket): Promise<void> {
  const user: User = {
    id: randomUUID(),
    ipAddress: socket.handshake.address
  };

  socket.data.userId = user.id;
  socket.join(user.id);
  await rClient.hSet(`online_user:${user.id}`, "ipAddress", user.ipAddress);

  registerPairingHandler(io, socket);
  registerChattingHandler(io, socket);
}
