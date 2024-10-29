import React, { useCallback, useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { LoginContext } from "../contexts/loginContext";
import { useQuery } from "@apollo/client";
import { GetPostQuery, GetUserQuery } from "../queries";
import { getUserImageNumber } from "../queries";
import Post from "../components/PostCard";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const {
    loading: loadingPosts,
    error: errorPosts,
    data: dataPosts,
    refetch: refetchPosts,
  } = useQuery(GetPostQuery);
  const {
    loading: loadingUsers,
    error: errorUsers,
    data: dataUsers,
  } = useQuery(GetUserQuery);

  const { setIsLoggedIn } = useContext(LoginContext);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchPosts();
    setRefreshing(false);
  }, [refetchPosts]);

  useFocusEffect(
    useCallback(() => {
      refetchPosts();
    }, [refetchPosts])
  );

  if (loadingPosts || loadingUsers) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center" }}>loading...</Text>
      </SafeAreaView>
    );
  }

  if (!loadingPosts && errorPosts) {
    console.log(error);
    return (
      <SafeAreaView style={styles.container}>
        <Text>{error.message}</Text>
      </SafeAreaView>
    );
  }

  if (errorUsers) {
    console.log(error);
    return (
      <SafeAreaView style={styles.container}>
        <Text>{error.message}</Text>
      </SafeAreaView>
    );
  }

  const renderStoryHeader = () => (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={dataUsers?.getUsers}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.storyItem}
          onPress={() =>
            navigation.navigate("Profile", {
              userId: item._id,
            })
          }>
          <Image
            source={{
              uri: `https://randomuser.me/api/portraits/men/${getUserImageNumber(
                item.username
              )}.jpg`,
            }}
            style={styles.storyImage}
          />
          <Text style={styles.storyUsername}>{item.username}</Text>
        </TouchableOpacity>
      )}
      style={styles.storiesContainer}
    />
  );

  if (!loadingPosts && !loadingUsers && dataPosts && dataPosts) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Instagram</Text>
          <View style={styles.headerIcons}></View>
        </View>

        <FlatList
          data={dataPosts?.getPosts}
          renderItem={({ item }) => (
            <Post post={item} navigation={navigation} refetch={refetchPosts} />
          )}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderStoryHeader} // Render the stories at the top
          ListHeaderComponentStyle={styles.storyListHeader}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    alignItems: "center",
  },
  headerIcons: {
    flexDirection: "row",
    width: 30,
    justifyContent: "space-between",
  },
  storiesContainer: {
    paddingVertical: 10,
  },
  storyListHeader: {
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  storyItem: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  storyImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#e1306c",
  },
  storyUsername: {
    marginTop: 5,
    fontSize: 12,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  postUserImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  postUsername: {
    fontWeight: "bold",
  },
});
