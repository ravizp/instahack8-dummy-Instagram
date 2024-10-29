import { gql } from "@apollo/client";

export const loginMutation = gql`
  mutation Mutation($input: LoginInput) {
    login(input: $input) {
      access_token
      userId
      username
    }
  }
`;

export const registerMutation = gql`
  mutation Register($input: RegisterInput) {
    register(input: $input) {
      message
    }
  }
`;

export const GetPostQuery = gql`
  query GetPosts {
    getPosts {
      _id
      authorId
      content
      imgUrl
      tags
      comments {
        content
        username
        createdAt
      }
      likes {
        username
        createdAt
      }
      createdAt
      Author {
        name
        username
        _id
      }
    }
  }
`;

export const GetUserQuery = gql`
  query GetUsers {
    getUsers {
      _id
      name
      username
    }
  }
`;

export const GetPostByIdQuery = gql`
  query GetPostById($input: PostByIdInput) {
    getPostById(input: $input) {
      _id
      authorId
      content
      imgUrl
      tags
      comments {
        content
        username
        createdAt
      }
      likes {
        username
      }
      createdAt
      Author {
        name
        username
      }
    }
  }
`;

export const likeOrUnlike = gql`
  mutation LikePost($input: LikeInput) {
    likePost(input: $input)
  }
`;

export const commentMutation = gql`
  mutation CommentPost($input: CommentInput) {
    commentPost(input: $input)
  }
`;

export const FOLLOW_N_UNFOLLOW_USER = gql`
  mutation Mutation($input: FollowInput) {
    followUser(input: $input)
  }
`;

export const GET_USER_BY_ID = gql`
  query Query($input: GetUserByIdInput) {
    getUserById(input: $input) {
      Followers {
        _id
      }
      Followings {
        _id
      }
      _id
      name
      username
      email
      Posts {
        _id
        authorId
        content
        imgUrl
        tags
        comments {
          content
          createdAt
        }
        likes {
          createdAt
          updatedAt
        }
        createdAt
      }
    }
  }
`;

export const ADD_POST = gql`
  mutation AddPost($input: AddPostInput) {
    addPost(input: $input) {
      _id
      authorId
      content
      imgUrl
      tags
      comments {
        content
        username
        createdAt
        updatedAt
      }
      likes {
        username
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      Author {
        _id
        name
        username
      }
    }
  }
`;

export const SEARCH_USER = gql`
query SearchUser($input: SearchUserInput) {
  searchUser(input: $input) {
    _id
    name
    username
    email
  }
}
`

export const getUserImageNumber = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 100);
};
