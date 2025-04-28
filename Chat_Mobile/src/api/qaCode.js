import axios from './axios'; 


export const saveQaCode = async (sessionId, userId, token) => {
  try {
    const res = await axios.post(`/api/v1/qacode/save`, null, {
      params: { sessionId, userId, token },
    });
    return res.status === 200;
  } catch (error) {
    console.error('Lỗi gửi mã QR:', error);
    return false;
  }
};


export const findConversationIdByLinkGroup = async (linkGroup) => {
  try {
    const res = await axios.get(`/api/v1/conversations/conversationId/${linkGroup}`);
    return res.data; // Assuming the response contains the conversation ID
  }
  catch (error) {
    console.error('Lỗi tìm kiếm ID hội thoại:', error);
    return null; // Or handle the error as needed
  }

};


export const addMemberGroup = async (conversationId, memberId) => {
  try {
    const response = await axios.post(  
      `/api/v1/conversations/add-member/${conversationId}?id=${memberId}`
    );
    return response.data;  
  } catch (error) {
    console.error(
      "Error adding member to group:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Lỗi khi thêm thành viên vào nhóm"
    );
  }
};


// localhost:8080/api/v1/conversations/linkGroup/
export const getLinkGroup = async (conversationId) => {
  try {
    const response = await axios.get(`/api/v1/conversations/linkGroup/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching group link:", error);
    throw new Error("Lỗi khi lấy link nhóm");
  }
};
