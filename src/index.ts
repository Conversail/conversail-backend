import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import 'dotenv/config';
import { resolvers, typeDefs } from './graphql';

const PORT: number = Number(process.env.PORT) || 8000;

const server = new ApolloServer({
  typeDefs,
  resolvers

});

async function startServer(): Promise<void> {
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT }
  });

  console.log(`Server running on ${url}`);
}
startServer();
