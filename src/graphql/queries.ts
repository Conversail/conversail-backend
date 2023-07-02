import gql from 'graphql-tag';

const queries = gql`
  type Query {
    signIn: String
  }
`;

const queriesResolvers = {
  Query: {
  }
};

export { queries, queriesResolvers };
