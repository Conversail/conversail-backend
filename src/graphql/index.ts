import { types, typesResolvers } from "./types";
import { queries, queriesResolvers } from "./queries";
import { mutations, mutationsResolvers } from "./mutations";
import gql from "graphql-tag";

const typeDefs = gql`
  ${types}
  ${queries}
  ${mutations}
`;

const resolvers = {
  ...typesResolvers,
  ...queriesResolvers,
  ...mutationsResolvers
};

export { typeDefs, resolvers };
