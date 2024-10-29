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
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LoginContext } from "../contexts/loginContext";
import { useMutation, useQuery } from "@apollo/client";
import {
  GetPostByIdQuery,
  getUserImageNumber,
  commentMutation,
  likeOrUnlike,
} from "../queries";
import { useFocusEffect } from "@react-navigation/native";

export default function PostDetail({ navigation, route }) {
  const [refreshing, setRefreshing] = useState(false);
  const { postId } = route.params;
  const [imageRatio, setImageRatio] = useState(1);
  const [content, setContent] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLiked, setSelectedLiked] = useState(false);

  const { loading, error, data, refetch } = useQuery(GetPostByIdQuery, {
    variables: { input: { postId } },
    skip: !postId,
  });

  const post = data?.getPostById;
  const tags = post?.tags?.map((tag) => `#${tag}`).join(" ");

  const [likeOrUnlikeMutation] = useMutation(likeOrUnlike, {
    onCompleted: () => refetch(),
    onError: (error) => console.error(error),
  });

  const handleLike = async (postId) => {
    try {
      setSelectedLiked(false);
      if (postId) {
        await likeOrUnlikeMutation({ variables: { input: { postId } } });
        console.log("Liked post successfully");
      }
      setSelectedLiked(true)
    } catch (error) {
      console.log(error);
    }
  };

  const [fnDispatch] = useMutation(commentMutation, {
    onCompleted: () => {
      setContent("");
      refetch();
    },
  });

  const handleComment = async (post) => {
    if (!post || !post._id) return;
    try {
      await fnDispatch({
        variables: { input: { content, postId: post._id } },
      });
      console.log("Comment posted successfully");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Instagram</Text>
      </View>

      {post && (
        <View style={styles.postContainer}>
          <Pressable
            onPress={() =>
              navigation.navigate("Profile", { userId: post.Author["_id"] })
            }>
            <View style={styles.postHeader}>
              <Image
                source={{
                  uri: `https://randomuser.me/api/portraits/men/${getUserImageNumber(
                    post?.Author?.username
                  )}.jpg`,
                }}
                style={styles.postUserImage}
              />
              <Text style={styles.postUsername}>{post?.Author?.username}</Text>
            </View>
          </Pressable>

          <Image
            source={{ uri: post?.imgUrl }}
            style={[styles.postImage, { aspectRatio: imageRatio }]}
          />

          <View style={styles.postActions}>
            <Pressable onPress={() => handleLike(post._id)}>
              <Ionicons
                name={selectedLiked ? "heart" : "heart-outline"} // Ubah icon based on liked state
                size={24}
                color={selectedLiked ? "red" : "black"} // Ubah warna berdasarkan liked state
                style={styles.icon}
              />
            </Pressable>
            <Pressable>
              <Ionicons
                name="chatbubble-outline"
                size={24}
                color="black"
                style={styles.icon}
                onPress={() => setModalVisible(true)}
              />
            </Pressable>
          </View>

          <Text style={styles.likesCount}>
            {post?.likes?.length || 0} likes
          </Text>

          <View style={styles.captionContainer}>
            <Text style={styles.username}>{post?.Author?.username}</Text>
            <Text style={styles.content}>{post?.content}</Text>
          </View>
          <Text style={styles.tags}>{tags}</Text>
          <Pressable onPress={() => setModalVisible(true)}>
            <Text style={styles.viewComments}>
              View all {post?.comments?.length} comments
            </Text>
          </Pressable>
          <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>

          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-outline" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Comments</Text>
              </View>

              <ScrollView style={styles.commentsContainer}>
                {post?.comments?.length > 0 ? (
                  post.comments.map((comment, index) => (
                    <View key={index} style={styles.commentItem}>
                      <Text style={styles.commentUsername}>
                        {comment.username}
                      </Text>
                      <Text>{comment.content}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noComments}>No comments yet.</Text>
                )}
              </ScrollView>

              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={content}
                  onChangeText={setContent}
                />
                <TouchableOpacity onPress={() => handleComment(post)}>
                  <Text style={styles.postCommentButton}>Post</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red" },
  postContainer: { padding: 10 },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  postUserImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  postUsername: { fontWeight: "bold", fontSize: 16 },
  postImage: { width: "100%", backgroundColor: "#f0f0f0" },
  postActions: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  icon: { marginRight: 15 },
  likesCount: { paddingHorizontal: 10, fontWeight: "bold" },
  captionContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  username: { fontWeight: "bold", marginRight: 5 },
  content: { flexShrink: 1 },
  tags: { color: "#3897f0", paddingHorizontal: 10, fontWeight: "bold" },
  viewComments: { paddingHorizontal: 10, color: "gray", marginTop: 5 },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalTitle: { marginLeft: 15, fontSize: 18, fontWeight: "bold" },
  commentsContainer: { padding: 15 },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
  },
  commentUsername: { fontWeight: "bold", marginBottom: 2 },
  noComments: { color: "gray", textAlign: "center", marginTop: 20 },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
  },
  postCommentButton: {
    color: "#3897f0",
    marginLeft: 10,
    fontWeight: "bold",
  },
  timestamp: {
    color: "gray",
    fontSize: 12,
    padding: 10,
    paddingTop: 0,
  },
});
