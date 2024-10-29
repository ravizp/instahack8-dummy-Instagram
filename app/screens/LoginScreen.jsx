import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useContext } from "react";

import { useMutation } from "@apollo/client";
import { loginMutation } from "../queries";
import * as SecureStore from "expo-secure-store";

import { LoginContext } from "../contexts/loginContext";

import Toast from "react-native-toast-message";

const LoginScreen = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(LoginContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [fnDispatch, { loading, error, data }] = useMutation(loginMutation, {
    onCompleted: async (res) => {
      let access_token = null;

      if (res && res.login && res.login.access_token) {
        access_token = res.login.access_token;
      }

      await SecureStore.setItemAsync("access_token", access_token);

      let userId = null;

      if (res && res.login && res.login.userId) {
        userId = res.login.userId;
      }

      await SecureStore.setItemAsync("userId", userId);

      Toast.show({
        type: "success",
        text1: "Success Logged In",
      });

      setIsLoggedIn(true);
    },
    onError: (error) => {
      console.log(error);

      Toast.show({
        type: "error",
        text1: "Username or Password is required",
        text2: "Please Check your username or password ",
      });
    },
  });

  const handleLogin = async () => {
    if (!username || !password) {
      console.error("Email or Password is required");
      return;
    }

    const usernameNotNull = username.replace(" ", "");

    console.log(username, password);

    await fnDispatch({
      variables: {
        input: {
          username,
          password,
        },
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}>
        <View style={styles.logoContainer}>
          <Text style={styles.instagramText}>Instagram</Text>
          <Text style={styles.welcomeText}>Welcome Back Seleb Gram</Text>
          <Image
            source={{ uri: "https://picsum.photos/200" }} // Replace with your app logo
            style={styles.logo}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Input your username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <Pressable
          style={[
            styles.loginButton,
            { opacity: username && password ? 1 : 0.5 },
          ]}
          onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
          <Toast />
        </Pressable>
      </KeyboardAvoidingView>
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.signupLink}>Sign up.</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  instagramText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: "#8e8e8e",
    marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#3897f0",
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: "#3897f0",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  signupText: {
    color: "#999",
  },
  signupLink: {
    color: "#3897f0",
    fontWeight: "bold",
  },
});

export default LoginScreen;
