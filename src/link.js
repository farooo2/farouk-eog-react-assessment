import { split, HttpLink } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from 'apollo-utilities';
import React from 'react';
import { render } from 'react-dom';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.tsx';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, useSubscription, gql } from '@apollo/client';

const httpLink = new HttpLink({
  uri: 'https://react.eogresources.com/graphql',
});
const wsLink = new WebSocketLink({
  uri: 'wss://react.eogresources.com/graphql',
  options: {
    reconnect: true,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
