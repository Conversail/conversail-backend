export enum EventsFromClient {
  startPairing = "startPairing",
  cancelChatting = "cancelChatting",
  sendMessage = "sendMessage",
  startedTyping = "startedTyping",
  stoppedTyping = "stoppedTyping",
  reportMate = "reportMate"
}

export enum EventsToClient {
  paired = "paired",
  chatEnded = "chatEnded",
  incomingMessage = "incomingMessage",
  startedTyping = "startedTyping",
  stoppedTyping = "stoppedTyping"
}
