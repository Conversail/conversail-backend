import gql from 'graphql-tag';
import { pubSub } from '..';

const subscriptions = gql`
  type Subscription {
    newMessage: String!
  }
`;

const subscriptionsResolvers = {
  Subscription: {
    newMessage: {
      subscribe: () => pubSub.asyncIterator(['NEW_MESSAGE'])
    }
  }
};

export { subscriptions, subscriptionsResolvers };
