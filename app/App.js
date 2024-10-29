import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StackHolder from './stacks/StackHolder';

import client from './config/apolloClient';


// Import LoginProvider to provide LoginContext
import { LoginProvider } from './contexts/loginContext';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <SafeAreaProvider>
        <LoginProvider>
            <StackHolder/>
        </LoginProvider>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}
