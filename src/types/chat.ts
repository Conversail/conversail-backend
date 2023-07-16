export type Connection = {
  id: string
  createdAt: Date
  ipAddress: string
  chatPreferences: ChatPreferences
};

export type ChatPreferences = {
  id: string
  createdAt: Date
  pairingLanguage: string
  allowImages: boolean
  allowVoiceMessages: boolean
};

export type Message = {
  id: string
  content: string
  replyTo?: string
  createdAt: Date
  fromYourself: boolean
};
