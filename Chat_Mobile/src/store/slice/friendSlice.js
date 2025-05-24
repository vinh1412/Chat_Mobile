import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {  acceptFriendReq, getFriendReqReceived, getFriendReqSent, recallFriendReq, rejectFriendReq, sendFriendReq, checkFriend, unfriendFriend } from "../../api/friendApi";
import { getFriendList } from "../../api/userApi";
const initialState = {
    friends: [],
    friend: null,
    sentRequests: [],
    receivedFriendRequests: [],
    isLoading: true,
    isSuccess: false,
    error: null,
    friendStatus: false,
}; 

const getMyFriends = createAsyncThunk('friend/getMyFriends', getFriendList);
const getReqsReceived = createAsyncThunk('friend/getReqsReceived', getFriendReqReceived);
const getReqsSent = createAsyncThunk('friend/getReqsSent', getFriendReqSent);
const recallReq = createAsyncThunk('friend/recallReq', recallFriendReq);
const acceptReq = createAsyncThunk('friend/acceptReq', acceptFriendReq);
const rejectReq = createAsyncThunk('friend/rejectReq', rejectFriendReq);
const checkFriendStatus = createAsyncThunk('friend/checkStatus', checkFriend);
const unfriend = createAsyncThunk('friend/unfriend', unfriendFriend);

const sendReq = createAsyncThunk('friend/sendReq', async (friendId, thunkAPI) => {
    console.log("friendId", friendId);
    try {
        const response = await sendFriendReq(friendId);
        return response;
    } catch (error) {
        console.log("Error sending friend request:", error);
        return thunkAPI.rejectWithValue(
            (typeof error?.response?.data?.message === 'string' && error.response.data.message)
            || (typeof error?.message === 'string' && error.message)
            || "Không thể gửi lời mời kết bạn."
        );

    }
});

const friendSlice = createSlice({
    name: "friend",
    initialState,
    reducers: {
        setFriends(state, action) {
            const newFriend = action.payload;
            if(state.friends.some(friend => friend.userId === newFriend.userId)) {
                state.friends = state.friends.map(friend => {
                    if(friend.userId === newFriend.userId) {
                        return newFriend;
                    }
                    return friend;
                });
            } else {
                state.friends.push(newFriend);
            }
        },
        setFriends_Unfriend(state, action) {
            state.friends = state.friends.filter(friend => friend?.userId !== action.payload?.userId);
        },
        setSentRequests(state, action) {
            state.sentRequests = action.payload;
        },
        setReceivedFriendRequests(state, action) {
            state.receivedFriendRequests = action.payload;
        },
        addReceivedRequest(state, action) {
            if (!state.receivedFriendRequests) {
                state.receivedFriendRequests = [];
            }
            state.receivedFriendRequests.push(action.payload);
        },
        setFriendStatus(state, action) {
            state.friendStatus = action.payload;
        }
    },
    extraReducers: (builder) => {
        //getMyFriends
        builder.addCase(getMyFriends.pending, (state) => {})
        builder.addCase(getMyFriends.fulfilled, (state, action) => {
            state.isLoading = false;
            state.friends = action.payload.response;
        })
        builder.addCase(getMyFriends.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        })

        //getReqsReceived
        builder.addCase(getReqsReceived.pending, (state) => {
        });
        builder.addCase(getReqsReceived.fulfilled, (state, action) => {
            state.receivedFriendRequests = action.payload.response;
            state.isLoading = false;
        })
        builder.addCase(getReqsReceived.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        })

        //getReqsSent
        builder.addCase(getReqsSent.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getReqsSent.fulfilled, (state, action) => {
            state.sentRequests = action.payload.response;
            state.isLoading = false;
        });
        builder.addCase(getReqsSent.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        });

        //send request
        builder.addCase(sendReq.pending, (state) => {
        });
        builder.addCase(sendReq.fulfilled, (state, action) => {
            state.isLoading = false;
            state.sentRequests = [...state.sentRequests, action.payload.response];
            state.isSuccess = true;
        });
        builder.addCase(sendReq.rejected, (state, action) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.error = action.error.message;
        });

        //recall request
        builder.addCase(recallReq.pending, (state) => {
        });
        builder.addCase(recallReq.fulfilled, (state, action) => {
            state.isLoading = false;
            state.sentRequests = state.sentRequests.filter(item => item.requestId !== action.payload );
        });
        builder.addCase(recallReq.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        });

        //accept request
        builder.addCase(acceptReq.pending, (state) => {
        });
        builder.addCase(acceptReq.fulfilled, (state, action) => {
            state.isLoading = false;
            state.receivedFriendRequests = state.receivedFriendRequests.filter(item => item.requestId !== action.payload );
            state.friends = [...state.friends, action.payload.response];
        })
        builder.addCase(acceptReq.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        });

        //reject request
        builder.addCase(rejectReq.pending, (state) => {
        });
        builder.addCase(rejectReq.fulfilled, (state, action) => {
            state.isLoading = false;
            state.receivedFriendRequests = state.receivedFriendRequests.filter(item => item.requestId !== action.payload );
        })
        builder.addCase(rejectReq.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        });

        //check friend status
        builder.addCase(checkFriendStatus.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(checkFriendStatus.fulfilled, (state, action) => {
            state.isLoading = false;
            state.friendStatus = action.payload;
        })
        builder.addCase(checkFriendStatus.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        });

        //unfriend
        builder.addCase(unfriend.pending, (state) => {
            state.isLoading = true;
        })
        builder.addCase(unfriend.fulfilled, (state, action) => {
            state.isLoading = false;
            state.friends = state.friends.filter(item => item.userId !== action.payload);
        })
        builder.addCase(unfriend.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message;
        })
    }
})

export const { setFriends, setFriend, setSentRequests, setReceivedFriendRequests, setFriendStatus, addReceivedRequest, setFriends_Unfriend } = friendSlice.actions;
export { getMyFriends, getReqsReceived, getReqsSent, rejectReq, recallReq, acceptReq, sendReq, checkFriendStatus , unfriend};
export default friendSlice.reducer;