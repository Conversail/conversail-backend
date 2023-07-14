import gql from "graphql-tag";

const mutations = gql`
  type Mutation {
    signUp: String
  }
`;

const mutationsResolvers = {
  Mutation: {
  }
};

export { mutations, mutationsResolvers };
