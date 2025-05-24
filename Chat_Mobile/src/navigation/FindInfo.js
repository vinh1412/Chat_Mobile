import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import IconA from "react-native-vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { search } from "../store/slice/userSlice";
import { sendReq, checkFriendStatus, getReqsReceived, getReqsSent } from "../store/slice/friendSlice";
import { createConversation, getAllConversationsByUserId } from "../store/slice/conversationSlice"
import { checkFriend } from "../api/friendApi";
import { sendRequestToWebSocket } from "../config/socket";

const { width } = Dimensions.get("window"); // Lấy kích thước màn hình

const ItemSerch = ({item, isFriend, isSuccessSent, sendRequest, getChat, isSentReq, isReceivedReq}) => {

  console.log("isFriend", isFriend);
  return (
      <TouchableOpacity key={item?.id} 
          style={{cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0'}}
          onPress={() => { getChat(item); }}
      >
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={{ uri: item?.avatar }} style={styles.contactImage} />
              <Text style={{marginLeft: 8, fontSize: 16}}>{item?.display_name}</Text>
          </View>
          {/* Kiem tra xem co phai ban khong */}
          {!isFriend ? (

                  <TouchableOpacity  style={{fontSize: '12px', padding: '4px 8px', backgroundColor: (isSentReq || isReceivedReq) ? "#E9EBED" : '#D6E9FF', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10}} onPress={() => {sendRequest(item?.id)}} disabled={isSentReq || isReceivedReq }>
                      
                      {isSentReq ? (
                        <Text style={{ color: "#141415" }}>Đã gửi lời mời</Text>
                      ) : isReceivedReq ? (
                        <Text style={{ color: "#141415" }}>Phản hồi</Text>
                      ) : (
                        <Text style={{ color: "#006AF5" }}>Kết bạn</Text>
                      )}
                      
                  </TouchableOpacity>
              
          ): (<View></View>)}
          
      </TouchableOpacity>
  )
}

const FindInfo = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { searchResults, user } = useSelector((state) => state.user);
  const { isSuccess, error, receivedFriendRequests, sentRequests } = useSelector((state) => state.friend);

  const { conversation, conversations } = useSelector((state) => state.conversation);
  console.log("isSuccess", isSuccess);
  console.log("error", error);
  // console.log("conversation", conversation);

  const requestsReceived = useMemo(() => {
    if(receivedFriendRequests === null) return [];
    return receivedFriendRequests;
  }, [receivedFriendRequests]);

  const requestsSent = useMemo(() => {
    if(sentRequests === null) return [];
    return sentRequests;
  }, [sentRequests]);

  const [searchText, setSearchText] = useState("");
  const [friendStatus, setFriendStatus] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [isSentReq, setIsSentReq] = useState({});
  const [isReceivedReq, setIsReceivedReq] = useState({});

  // console.log("search ", searchText)
  // console.log("search res ", searchResults)
  const result = useMemo(() => {
    if (!Array.isArray(searchResults) || searchText.trim() === "") {return []};
    return searchResults?.filter((item) => item?.id !== user?.id); // Loại bỏ người dùng hiện tại khỏi danh sách kết quả
  }, [searchResults, searchText, user?.id]);

  // console.log("result", result);

  useEffect(() => {
        dispatch(getReqsReceived());
  }, []);

  useEffect(() => {
        dispatch(getReqsSent());
  }, []);

  // Kiểm tra trạng thái bạn bè
  useEffect(() => {
    const checkIsFriend = async () => {
      if (!result || result.length === 0) return;

      const statusUpdates = {};
      for (const item of result) {
        try {
          // kiểm tra là bạn bè hay chưa
          const response = await dispatch(checkFriendStatus(item?.id)).unwrap();
          statusUpdates[item?.id] = response;

        } catch (error) {
          console.log(`Lỗi khi kiểm tra trạng thái bạn bè cho ${item?.id}:`, error);
          statusUpdates[item?.id] = false; 
        }

        //kiểm tra đã gửi lời mời hay chưa
          const isSent = requestsSent.find((req) => req?.userId === item?.id);
          if (isSent) {
            setIsSentReq((prev) => ({...prev, [item?.id] : true}))
          } else {
            setIsSentReq((prev) => ({...prev, [item?.id] : false}))
          }

          //kiểm tra đã nhận lời mời hay chưa
          const isReceived = requestsReceived.find((req) => req?.userId === item?.id);
          if(isReceived) {
            setIsReceivedReq((prev) => ({...prev, [item?.id]: true}));
          } else {
            setIsReceivedReq((prev) => ({...prev, [item?.id]: false}));
          }
      }
      setFriendStatus((prev) => ({ ...prev, ...statusUpdates }));
    };

    checkIsFriend();
  }, [result, dispatch]);


  // Xu lý tìm kiếm
  const handleSearch = async (keyword) => {
    if (keyword.trim() === "") {

    }; // Nếu không có từ khóa thì không làm gì cả
    try {
      const response = await dispatch(search(keyword)).unwrap();
      if (response?.status === "SUCCESS") {
        console.log("Kết quả tìm kiếm:", response.response);
      } else {
        console.log("Không tìm thấy kết quả nào.");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  useEffect(() => {
    if (searchText) {
      handleSearch(searchText);
    }
  }, [searchText]);

  // handle gửi lời mời kết bạn
  const handleSendRequest = async (friendId) => {
      sendRequestToWebSocket({ receiverId: friendId });
      setIsSentReq((prev) => ({ ...prev, [friendId]: true }));
  }


  // Render Item cho danh sách liên hệ
  const renderContact = useCallback(
    ({ item }) => (
      <View style={styles.contactItem}>
        <Image source={{ uri: item.image }} style={styles.contactImage} />
        <Text style={styles.contactName}>{item.name}</Text>
      </View>
    ),
    []
  );

  // Render Item cho lịch sử tìm kiếm
  const renderHistory = useCallback(
    ({ item }) => (
      <View style={styles.historyItem}>
        <Icon name="search-outline" size={20} color="#999" />
        <Text style={styles.historyText}>{item}</Text>
      </View>
    ),
    []
  );

  // createConversation
  const handleCreateConversation = async (item) => {
    // Xử lý khi người dùng nhấn vào một mục trong danh sách tìm kiếm
    if(!item?.id || !item) return;
    

    try {
      if(Array.isArray(conversations)) {

        for ( const conversation of conversations) {
          const userReceived = conversation?.members.find((member) => member?.id === item?.id);
  
          if(userReceived) {
            // Alert.alert("Thông báo", "Cuộc trò chuyện đã tồn tại", [{ text: "OK" }], { cancelable: false });
            console.log("Cuộc trò chuyện đã tồn tại");
  
            navigation.navigate("SingleChatScreen", { conversationId: conversation?.id, userReceived: userReceived });
  
            return;
          }
        }
      }

      const request = {
        is_group: false,
        member_id: [item?.id],
      }

      const response = await dispatch(createConversation(request)).unwrap();
      console.log("response", response);
      
      // Cập nhật danh sách cuộc trò chuyện sau khi tạo thành công
      await dispatch(getAllConversationsByUserId()).unwrap();
      navigation.navigate("SingleChatScreen", { conversationId: response?.id, userReceived: item });
      
      console.log("Đã cập nhật danh sách cuộc trò chuyện.");
    } catch (error) {
      console.log("Lỗi khi tạo cuộc trò chuyện:", error);
      Alert.alert("Lỗi", "Không thể tạo cuộc trò chuyện. Vui lòng thử lại.", [{ text: "OK" }]);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#006AF5", "#5FCBF2"]}
        locations={[0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBox}>
          <IconA name="search1" size={24} color="#fff" />
          <TextInput
            placeholder="Tìm kiếm"
            placeholderTextColor={"#B8D9FF"}
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </TouchableOpacity>
      </LinearGradient>

      {result.length === 0 ? (
        <View>
          <Text style={styles.sectionTitle}>Không có kết quả nào được tìm thấy</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.sectionTitle}>
            Kết quả tìm kiếm cho "{searchText}"
          </Text>
          <FlatList
            data={result}
            keyExtractor={(item) => item?.id}
            renderItem={({ item }) =>
              ItemSerch({
                item,
                sendRequest: (id) => handleSendRequest(id),
                isSuccessSent: isSuccess,
                isFriend: friendStatus[item?.id],
                isSentReq: isSentReq[item?.id],
                isReceivedReq: isReceivedReq[item?.id],
                getChat: (item) => handleCreateConversation(item)
              })}
          />
        </View>
      )}

    </View>
  );
};

// 🎨 **StyleSheet**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 20, // Chừa khoảng trống phía dưới
    paddingTop: StatusBar.currentHeight || 0,
  },

  // Header Gradient
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },

  // Thanh tìm kiếm
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 15,
    borderRadius: 25,
    height: 40,
    width: width * 0.9,
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },

  // Tiêu đề từng phần
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    padding: 10,
  },

  // Liên hệ đã tìm
  contactItem: {
    alignItems: "center",
    marginRight: 15,
    padding: 10,
  },
  contactImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contactName: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },

  // Truy cập nhanh
  quickAccessContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },

  // Lịch sử tìm kiếm
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    padding: 10,
  },
  historyText: {
    fontSize: 14,
    marginLeft: 10,
  },

  // Nút chỉnh sửa lịch sử tìm kiếm
  editHistoryText: {
    color: "#007AFF",
    padding: 10,
  },
});

export default FindInfo;
