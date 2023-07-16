import { prisma } from "..";
import rClient from "./redis";

export async function getRoomAndReceiverId(
  connectionId: string
): Promise<{ roomKey: string, receiverId: string }> {
  const chatKeys = await rClient.keys(`chat:*${connectionId}*:room`);

  if (chatKeys.length !== 1) return { roomKey: null, receiverId: null };

  const receiverId = chatKeys[0]
    .replace(connectionId, "")
    .replace("chat:", "")
    .replace("_", "")
    .replace(":room", "");

  return {
    roomKey: chatKeys[0],
    receiverId
  };
}

export async function handleFinishedChat(connectionId: string): Promise<void> {
  const { roomKey, receiverId } = await getRoomAndReceiverId(connectionId);

  if (roomKey) {
    const keys = await rClient.keys(`${roomKey}*`);
    const receiver = await rClient.hGetAll(`connection:${receiverId}`);

    const multi = rClient.multi();
    keys.forEach(key => {
      (async () => {
        multi.rename(key, `finished_chat:${connectionId}:room${key.split(":room")[1]}`);
      })();
    });
    multi.hSet(`finished_chat:${connectionId}:room:receiver`, receiver);
    await multi.exec();
  } else {
    const keys = await rClient.keys(`finished_chat:${connectionId}:room*`);

    const multi = rClient.multi();
    keys.forEach((key) => {
      (async () => {
        multi.del(key);
      })();
    });
    await multi.exec();
  }
}

export async function createReport({ reason, authorId }: { reason: string, authorId: string }): Promise<void> {
  const { roomKey, receiverId } = await getRoomAndReceiverId(authorId);

  let key: string;
  let recipient: Record<string, any>;
  const author = await rClient.hGetAll(`connection:${authorId}`);
  const chatId = await rClient.get(roomKey);

  if (roomKey) {
    key = roomKey;
    recipient = await rClient.hGetAll(`connection:${receiverId}`);
  } else {
    const finishedChatKey = await rClient.keys(`finished_chat:${authorId}:room`);

    if (finishedChatKey.length !== 0) {
      const receiver = await rClient.hGetAll(`finished_chat:${authorId}:room:receiver`);

      if (recipient.id) {
        key = finishedChatKey[0];
        recipient = receiver;
      }
    }
  }

  if (!key || !recipient || !author || chatId) return;

  const connections = [author, recipient];
  connections.sort((a, b) => a.id - b.id);

  const messageKeys = await rClient.keys(`${key}:message:*`);
  const messages = await Promise.all(messageKeys.map(async messageKey => {
    const message = await rClient.hGetAll(messageKey);
    const messageId = messageKey.split(":").pop();

    return {
      id: messageId,
      createdAt: message.createdAt,
      senderId: message.sender,
      receiverId: message.receiver,
      content: message.content,
      replyTo: message.replyTo,
      chatId
    };
  }));

  await prisma.report.create({
    data: {
      reason,
      finished: false,
      author: {
        connectOrCreate: {
          where: {
            id: author.id
          },
          create: {
            id: author.id,
            ipAddress: author.ipAddress
          }
        }
      },
      recipient: {
        connectOrCreate: {
          where: {
            id: recipient.id
          },
          create: {
            id: recipient.id,
            ipAddress: recipient.ipAddress
          }
        }
      },
      chat: {
        connectOrCreate: {
          where: {
            id: chatId
          },
          create: {
            id: chatId,
            connection1: {
              connect: {
                id: connections[0].id
              }
            },
            connection2: {
              connect: {
                id: connections[1].id
              }
            },
            messages: {
              createMany: {
                data: messages
              }
            }
          }
        }
      }
    }
  });
}
