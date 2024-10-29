import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useMutation } from "@apollo/client";
import { registerMutation } from "../queries";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [fnDispatch, { loading, error, data }] = useMutation(registerMutation, {
    onCompleted: async (res) => {
      navigation.navigate("Login");
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const handleRegister = async () => {
    if (!name || !username || !email || !password) {
      console.error("Name, username, email or password is required");
      return;
    }

    try {
      await fnDispatch({
        variables: {
          input: {
            name,
            username,
            email,
            password,
          },
        },
      });

      console.log("berhasil register");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: "https://picsum.photos/200" }} // Replace with your app logo
              style={styles.logo}
            />
          </View>
          <Text style={styles.headerText}>
            Sign up to see photos and videos from your friends.
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
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
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            By signing up, you agree to our Terms, Data Policy and Cookies
            Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Have an account? </Text>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Log in.</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  headerText: {
    fontSize: 18,
    textAlign: "center",
    color: "#999",
    marginBottom: 20,
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
  registerButton: {
    backgroundColor: "#3897f0",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  termsText: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginText: {
    color: "#999",
  },
  loginLink: {
    color: "#3897f0",
    fontWeight: "bold",
  },
});
