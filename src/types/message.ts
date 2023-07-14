export type Message = {
  id: string
  content: string
  replyTo?: string
  createdAt: Date
  fromYourself: boolean
};
