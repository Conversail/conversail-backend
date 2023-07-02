import gql from 'graphql-tag';

const types = gql`
  enum UserRole {
    MEMBER
    MODERATOR
  }

  interface User {
    id: ID!
    chatPreferences: ChatPreferences!
    createdAt: String!
  }

  type ChatPreferences {
    id: ID!
    user: User!
    pairingLanguage: String!
    allowImages: Boolean!
    allowVoiceMessages: Boolean!
  }

  type Guest implements User {
    id: ID!
    chatPreferences: ChatPreferences!
    createdAt: String!
  }

  type Member implements User {
    id: ID!
    chatPreferences: ChatPreferences!
    createdAt: String!
    email: String!
    username: String!
    firstName: String!
    lastName: String
    password: String!
    role: UserRole!
  }

  type Connection {
    id: ID!
    ipAddress: String!
    user: User!
    createdAt: String!
  }

  type Chat {
    id: ID!
    user1: User!
    user2: User!
    messages: [Message]!
    createdAt: String!
  }

  type Message {
    id: ID!
    sender: User!
    receiver: User!
    content: String!
    replyTo: String
    createdAt: String!
  }

  type Report {
    id: ID!
    author: User!
    recipient: User!
    chat: Chat!
    createdAt: String!
  }
`;

const typesResolvers = {
};

export { types, typesResolvers };
