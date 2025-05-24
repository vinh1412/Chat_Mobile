import instance from "./axios";


// lấy bài viết theo iduser /posts/user/id
export const getPostsMyByUserId = async (userId) => {
  try {
    const response = await instance.get(`/api/v1/posts/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching posts by user ID:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Lỗi khi lấy bài viết của người dùng");
  }
};


// lấy bạn bè theo iduser  /api/v1/friend/my-friends/
export const getFriendsByUserId = async (userId) => {
  try {
    const response = await instance.get(`/api/v1/friend/my-friends/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching friends by user ID:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách bạn bè");
  }
};

// lấy danh sách tất ca cả bài viết /api/v1/posts/all
export const getAllPosts = async () => {
  try {
    const response = await instance.get('/api/v1/posts/all');
    return response.data;
  } catch (error) {
    console.error("Error fetching all posts:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Lỗi khi lấy tất cả bài viết");
  }
};

// lấy thong tin user khi biet id_user_friends
export const getUserById = async (id_user_friends) => {
  try {
    const response = await instance.get(`/api/v1/user/${id_user_friends}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by ID:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Lỗi khi lấy thông tin người dùng");
  }
};