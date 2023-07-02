import rClient from './redis';

export async function getRoomAndReceiverId(
  userId: string
): Promise<{ roomKey: string, receiverId: string }> {
  const chatKeys = await rClient.keys(`chat:*${userId}*:room`);

  if (chatKeys.length !== 1) return { roomKey: null, receiverId: null };

  const receiverId = chatKeys[0]
    .replace(userId, '')
    .replace('chat:', '')
    .replace('_', '')
    .replace(':room', '');

  return {
    roomKey: chatKeys[0],
    receiverId
  };
}
