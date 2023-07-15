import { ApolloServer } from "@apollo/server";
import "dotenv/config";
import { resolvers, typeDefs } from "./graphql";
import { createServer } from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import { Server } from "socket.io";
import { json } from "body-parser";
import connectionHandler from "./ws/connectionHandler";
import rClient from "./cache/redis";

export async function initRedis(): Promise<void> {
  await rClient.connect();
  await rClient.flushDb();
  rClient.on("error", (err) => { console.log("Redis Client Error", err); });
}
initRedis();

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {},
  path: "/ws"
});

io.on("connection", async (socket) => { await connectionHandler(io, socket); });

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

async function startServer(): Promise<void> {
  await server.start();
  app.use(cors(), json());
  app.use(
    "/graphql",
    expressMiddleware(server)
  );

  const PORT = process.env.PORT ?? 8000;
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`Server ready at http://localhost:${PORT}`);
}
startServer();
