import instance from "./axios";


export const getFriendReqReceived = async () => {
    try {
        const response = await instance.get("/api/v1/friend/friend-requests/received");
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
export const getFriendReqSent = async () => {
    try {
        const response = await instance.get("/api/v1/friend/friend-requests/sent");
        return response.data;
    } catch (error) {
        console.error("Error fetching friend requests sent:", error);
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log("Other error:", error.message);
        }
        throw error;
    }
}
export const sendFriendReq = async (receiverId) => {
    console.log("receiverId", receiverId);
    try {
        const response = await instance.post("/api/v1/friend/send-request", { receiverId });
        return response.data;
    } catch (error) {
        console.log("Error sending friend request:", error);
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log("Other error:", error.message);
        }
        throw error;
    }
}
export const acceptFriendReq = async (requestId) => {
    try {
        const response = await instance.post(`/api/v1/friend/accept-request/${requestId}`);
        return response.data;
    } catch (error) {
        console.error("Error accepting friend request:", error);
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log("Other error:", error.message);
        }
        throw error;
    }
}
export const rejectFriendReq = async (requestId) => {
    try {
        const response = await instance.post(`/api/v1/friend/reject-request/${requestId}`);
        return response.data;
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log("Other error:", error.message);
        }
        throw error;
    }
}
export const recallFriendReq = async (requestId) => {
    try {
        const response = await instance.post(`/api/v1/friend/recall-request/${requestId}`);
        return response.data;
    } catch (error) {
        console.error("Error recalling friend request:", error);
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log("Other error:", error.message);
        }
        throw error;
    }
}

export const checkFriend = async (friendId) => {
    try {
        const response = await instance.get(`/api/v1/friend/check-friend?friendId=${friendId}`);
        return response.data.response; 
    } catch (error) {
        console.error("Error checking friend:", error);
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log("Other error:", error.message);
        }
        throw error;
    }
}

export const unfriendFriend = async (friendId) => {
    try {
        const response = await instance.post(`/api/v1/friend/unfriend/${friendId}`);
        return response.data.response; 
    } catch (error) {
        console.error("Error unfriending friend:", error);
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log("Other error:", error.message);
        }
        throw error;
    }
}