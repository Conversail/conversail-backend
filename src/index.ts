import { ApolloServer } from '@apollo/server';
import 'dotenv/config';
import { resolvers, typeDefs } from './graphql';
import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PubSub } from 'graphql-subscriptions';

export const pubSub = new PubSub();

const app = express();
const httpServer = createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          }
        };
      }
    }
  ]
});

async function startServer(): Promise<void> {
  await server.start();

  app.use('/graphql', cors<cors.CorsRequest>(), bodyParser.json(), expressMiddleware(server));

  const PORT: number = Number(process.env.PORT) || 8000;
  httpServer.listen(PORT);

  console.log(`Server running on http://localhost:${PORT}`);
}
startServer();
