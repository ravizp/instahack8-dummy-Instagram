import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";

import { useMutation } from "@apollo/client";
import { likeOrUnlike } from "../queries";
import { getUserImageNumber, commentMutation } from "../queries";

const Post = ({ post, navigation, refetch }) => {
  const [imageRatio, setImageRatio] = useState(1);
  const [content, setContent] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedLiked, setSelectedLiked] = useState(false);

  const [fnDispatch] = useMutation(commentMutation, {
    onCompleted: (post) => {
      const newComment = post.comments;
      setSelectedPost((prev) => ({
        ...prev,
        content: [...prev.comments, newComment],
      }));
      setContent("");
      refetch();
    },
  });

  const handleViewComments = (post) => {
    setSelectedPost(post);
    setModalVisible(true);

    console.log(post.comments);
    console.log(post._id);
  };

  const handleComment = useCallback(
    async (post) => {
      if (!post || !post._id) return;
      try {
        await fnDispatch({
          variables: {
            input: { content, postId: post._id },
          },
        });
        console.log("Comment posted successfully");
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    },
    [content, fnDispatch]
  );

  const tags = post?.tags?.map((tag) => `#${tag}`).join(" ");

  useEffect(() => {
    Image.getSize(
      post.imgUrl,
      (width, height) => {
        setImageRatio(width / height);
      },
      (error) => {
        console.error("Failed to load image", error);
      }
    );
  }, [post.imgUrl]);

  const [
    likeOrUnlikeMutation,
    { loading: likeLoading, error: likeError, data: likeData },
  ] = useMutation(likeOrUnlike, {
    onCompleted: (res) => {
      refetch();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleLike = async (postId) => {
    try {
      setSelectedLiked(false)
      if (postId) {
        await likeOrUnlikeMutation({
          variables: {
            input: {
              postId,
            },
          },
        });
      }
      setSelectedLiked(true)
      console.log("berhasil like");
    } catch (error) {
      console.log(error);
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

  return (
    <>
      <View key={post.id} style={styles.post}>
        <Pressable
          onPress={() =>
            navigation.navigate("Profile", {
              userId: post.Author["_id"],
            })
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

        <Text style={styles.likesCount}>{post?.likes?.length || 0} likes</Text>

        <View style={styles.caption}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ProfileScreen", {
                userId: post.Author["_id"],
              })
            }>
            <Text style={styles.username}>{post?.Author?.username}</Text>
          </TouchableOpacity>
          <Text style={styles.content}>{post?.content}</Text>
        </View>
        <Text style={styles.caption}>
          <Text style={styles.tags}>{tags}</Text>
        </Text>
        <Pressable onPress={() => handleViewComments(post)}>
          <Text style={styles.viewComments}>
            View all {post.comments.length} comments
          </Text>
        </Pressable>
        <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
      </View>
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

          {/* ScrollView for comments */}
          <ScrollView style={styles.commentsContainer}>
            {post?.comments?.length > 0 ? (
              post.comments.map((comment, index) => (
                <View key={index} style={styles.commentItem}>
                  <Text style={styles.commentUsername}>{comment.username}</Text>
                  <Text>{comment.content}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noComments}>No comments yet.</Text>
            )}
          </ScrollView>

          {/* Input for new comment */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={content}
              onChangeText={setContent}
            />
            <TouchableOpacity onPress={() => handleComment(selectedPost)}>
              <Text style={styles.postCommentButton}>Post</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  post: {
    marginBottom: 15,
    backgroundColor: "#fff",
    // Removed the border here to eliminate post borders
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  postUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#e1e1e1", // Placeholder color in case no image
  },
  postUsername: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    // Aligned content by setting padding to 0
    paddingHorizontal: 10,
  },
  postImage: {
    width: "100%",
    backgroundColor: "#f9f9f9",
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingBottom: 2,
  },
  icon: {
    marginHorizontal: 10,
  },
  likesCount: {
    fontWeight: "bold",
    paddingHorizontal: 10,
    marginBottom: 5,
    color: "#333",
  },
  caption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  username: {
    fontWeight: "bold",
    marginRight: 5,
    color: "#333",
  },
  content: {
    color: "#333",
    flexShrink: 1,
  },
  tags: {
    fontSize: 14,
    paddingHorizontal: 5,
    color: "#3897f0",
    fontWeight: "bold",
  },
  viewComments: {
    color: "#999",
    marginTop: 5,
    marginLeft: 10,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  commentsContainer: {
    flex: 1,
    padding: 15,
  },
  commentItem: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  commentUsername: {
    fontWeight: "bold",
    marginRight: 5,
    color: "#333",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
  },
  postCommentButton: {
    color: "#3897f0",
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  timestamp: {
    color: "gray",
    fontSize: 12,
    padding: 10,
    paddingTop: 0,
  },
});

export default Post;
