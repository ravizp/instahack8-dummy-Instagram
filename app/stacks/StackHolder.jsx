import { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LoginContext } from "../contexts/loginContext";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";

// Import Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SearchScreen from "../screens/SearchScreen"; // Ensure this is imported correctly
import AddPostScreen from "../screens/AddPostScreen";
import PostDetail from "../screens/PostDetailScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const HomeStackScreen = ({ navigation }) => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="SearchScreen" component={SearchScreen} />
      <HomeStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <HomeStack.Screen name="PostDetail" component={PostDetail} />
    </HomeStack.Navigator>
  );
};

const BottomTabs = ({ navigation }) => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const getSecureStoreItem = async (key) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value !== null) {
        setUserId(value);
      }
    } catch (error) {
      console.error("Error retrieving userId", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSecureStoreItem("userId");
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Create") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#888",
      })}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Create" component={AddPostScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ userId: userId }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // Cegah aksi default dan kirim ulang userId yang benar
            e.preventDefault();
            navigation.navigate("Profile", { userId });
          },
        })}
      />
    </Tab.Navigator>
  );
};

const StackHolder = () => {
  const { isLoggedIn } = useContext(LoginContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={BottomTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default StackHolder;
