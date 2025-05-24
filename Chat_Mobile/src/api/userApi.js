import instance from "./axios";

export async function getCurrentUser() {
    
    try {
        const response = await instance.get('/api/v1/user/me');
        return response.data;
    } catch (error) {
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data); // << cái này sẽ cho biết lý do 400
          } else {
            console.log("Other error:", error.message);
          }
          throw error;
    }
}

export async function updateProfile(formData) {
    
    console.log("formData");
    console.log(formData._parts);
    try {
        const response = await instance.put('/api/v1/user/me/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log("response");
        console.log(response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data); // << cái này sẽ cho biết lý do 400
          } else {
            console.log("Other error:", error.message);
          }
          throw error;
    }
}

export async function changePassword(data) {
    try {
        const response = await instance.put('/api/v1/user/change-password', data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log("Other error:", error.message);
        }
        throw error;
    }
}

export const getFriendList = async () => {
  try {
    const response = await instance.get("/api/v1/user/my-friends");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching friend list:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch friend list"
    );
  }
};

export const searchUser = async (keyword) => {
    try {
      const response = await instance.get(`/api/v1/user/search?keyword=${keyword}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error searching user:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to search user"
      );
    }
  };

  // getusre by id
export const getUserById = async (userId) => {
    try {
      const response = await instance.get(`/api/v1/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching user by ID:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch user by ID"
      );
    }
  };

