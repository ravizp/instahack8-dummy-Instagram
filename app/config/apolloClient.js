import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import * as SecureStore from "expo-secure-store";

// const THE_URI = "https://server_inst.ravizarazka.my.id/"

const httpLink = createHttpLink({
  uri: "https://server-gc01.ravizarazka.my.id/",
});

// console.log(THE_URI);

const authLink = setContext(async (_, { headers }) => {

  const access_token = await SecureStore.getItemAsync("access_token");

  return {
    headers: {
      ...headers,
      authorization: access_token ? `Bearer ${access_token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
