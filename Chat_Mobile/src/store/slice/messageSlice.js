import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  deleteMessageForUserService,
  getMessagesByConversationIdService,
  sendMessageService,
  uploadFile,
  leaveGroup,
  removeMemberGroup,
  addMemberGroup
} from "../../api/chatApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
  messages: [],
  deletedMessageIds: [],
  deletedMessage: null,
  message: null,
  error: null,
  isLoading: true,
};

const getAllMessagesByConversationId = createAsyncThunk(
  "conversation/getAllMessagesByConversationId",
  getMessagesByConversationIdService
);

const sendMessageToUser = createAsyncThunk(
  "conversation/sendMessage",
  sendMessageService
);

// const uploadFileThunk = createAsyncThunk("conversation/uploadFile", uploadFile);

// export const deleteMessageForUserThunk = createAsyncThunk(
//   "message/deleteForUser",
//   async ({ messageId, userId }, { dispatch }) => {
//     const response = await deleteMessageForUserService(messageId, userId);
//     // Sau khi xóa trên server thành công, gọi action local để cập nhật UI
//     dispatch(
//       deleteMessage({
//         id: messageId,
//         conversationId: response.response.conversationId,
//       })
//     );
//     return response;
//   }
// );

const deleteMessageForUserThunk = createAsyncThunk(
  "message/deleteForUser",
  deleteMessageForUserService
);

const leaveGroupThunk = createAsyncThunk("message/leaveGroup", async (conversationId, thunkAPI) => {
    try {
        const response = await leaveGroup(conversationId);
        return response;
    } catch (error) {
        console.error("Error leaving conversation group:", error.response?.data || error.message);
        return thunkAPI.rejectWithValue(error.response.data?.message || error.message);
    }
});
const removeMemberGroupThunk = createAsyncThunk("message/removeMemberGroup", async ({ conversationId, memberId }, thunkAPI) => {
    try {
        const response = await removeMemberGroup(conversationId, memberId);
        return response;
    } catch (error) {
        console.error("Error leaving conversation group:", error.response?.data || error.message);
        return thunkAPI.rejectWithValue(error.response.data?.message || error.message);
    }
});

const addMemberGroupThunk = createAsyncThunk("message/addMemberGroup", async ({conversationId, memberId}, thunkAPI) => {
    try {
      const response = await addMemberGroup(conversationId, memberId);
      return response;
    } catch (error) {
        console.error("Error adding member to conversation group:", error.response?.data || error.message);
        return thunkAPI.rejectWithValue(error.response.data?.message || error.message);
    }
})

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    addMessage(state, action) {
      // Không thêm tin nhắn nếu nó đã bị xóa phía mình

      // Dùng để cập nhật lại khi xóa message tại bất kỳ vị trí nào
      // Lấy index của message đã tồn tại trong mảng
      const indexMessage = state.messages.findIndex(
        (msg) => msg?.id === action.payload?.id
      );

      if (indexMessage !== -1) {
        // Nếu tồn tại thì cập nhật lại message
        state.messages[indexMessage] = action.payload;
      }

      // some() kiểm tra xem có tồn tại message id trong mảng hay không
      // Nếu không tồn tại thì thêm mới message vào mảng
      // const deletedId =
      //   state.deletedMessageIds[action.payload.conversationId] || [];

      // if (deletedId.includes(action.payload?.id)) {
      //   return;
      // }

      // some() kiểm tra xem có tồn tại message id trong mảng hay không
      // Nếu không tồn tại thì thêm mới message vào mảng
      if (!state.messages.some((msg) => msg?.id === action.payload?.id)) {
        // if(!deletedId.includes(action.payload?.id)) {
        state.messages.push(action.payload);
        // }
      }
    },
    setMessagesUpdate: (state, action) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    deleteMessage(state, action) {
      // const { id, conversationId } = action.payload;
      // state.messages = state.messages.filter(
      //   (message) => message.id !== action.payload.id
      // );
      // // Kiểm tra xem conversationId đã tồn tại trong deletedMessageIds chưa
      // if (!state.deletedMessageIds[conversationId]) {
      //   state.deletedMessageIds[conversationId] = [];
      // }
      // // them messageId vào mảng deletedMessageIds
      // state.deletedMessageIds[conversationId].push(id);
      // // Lưu deletedMessageIds vào AsyncStorage
      // AsyncStorage.setItem(
      //   `deletedMessages_${conversationId}`,
      //   JSON.stringify(state.deletedMessageIds[conversationId])
      // );
    },

    loadDeletedMessageIds: (state, action) => {
      // const { conversationId, deletedMessageIds } = action.payload;
      // state.deletedMessageIds[conversationId] = deletedMessageIds;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllMessagesByConversationId.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAllMessagesByConversationId.fulfilled, (state, action) => {
      state.messages = action.payload.response;
      state.isLoading = false;
    });
    builder.addCase(getAllMessagesByConversationId.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });

    //sendMessage
    builder.addCase(sendMessageToUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(sendMessageToUser.fulfilled, (state, action) => {
      state.messages.push(action.payload.response);
      state.isLoading = false;
    });
    builder.addCase(sendMessageToUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });

    //deleteMessageForUser
    builder.addCase(deleteMessageForUserThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(deleteMessageForUserThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.deletedMessage = action.payload.response;
    });
    builder.addCase(deleteMessageForUserThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });

    //leaveGroup
    builder.addCase(leaveGroupThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(leaveGroupThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.messages.push(action.payload.response);
    })
    builder.addCase(leaveGroupThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });

    //removeMemberGroupThunk
    builder.addCase(removeMemberGroupThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(removeMemberGroupThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.messages.push(action.payload.response);
    })
    builder.addCase(removeMemberGroupThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });

    //addMemberGroupThunk
    builder.addCase(addMemberGroupThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(addMemberGroupThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.messages.push(action.payload.response);
    })
    builder.addCase(addMemberGroupThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });
  },
});

export const {
  setMessagesUpdate,
  clearMessages,
  addMessage,
  deleteMessage,
  loadDeletedMessageIds,
} = messageSlice.actions;
export {
  getAllMessagesByConversationId,
  sendMessageToUser,
  deleteMessageForUserThunk,
  leaveGroupThunk,
  removeMemberGroupThunk,
  addMemberGroupThunk
};
export default messageSlice.reducer;

export const loadDeletedMessageIdsAsync =
  (conversationId) => async (dispatch) => {
    try {
      const deletedMessageIds = await AsyncStorage.getItem(
        `deletedMessages_${conversationId}`
      );
      console.log("deletedMessageIds: ", deletedMessageIds);
      if (deletedMessageIds) {
        dispatch(
          loadDeletedMessageIds({
            conversationId,
            deletedMessageIds: JSON.parse(deletedMessageIds),
          })
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải deletedMessageIds:", error);
    }
  };
