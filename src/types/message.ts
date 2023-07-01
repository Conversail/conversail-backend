export type Message = {
  id: string
  content: string
  replyTo?: string
  sentAt: Date
  fromYourself: boolean
};
