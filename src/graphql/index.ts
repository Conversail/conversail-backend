import { types, typesResolvers } from './types';
import { queries, queriesResolvers } from './queries';
import { mutations, mutationsResolvers } from './mutations';
import gql from 'graphql-tag';
import { subscriptions, subscriptionsResolvers } from './subscriptions';

const typeDefs = gql`
  ${types}
  ${queries}
  ${mutations}
  ${subscriptions}
`;

const resolvers = {
  ...typesResolvers,
  ...queriesResolvers,
  ...mutationsResolvers,
  ...subscriptionsResolvers
};

export { typeDefs, resolvers };
