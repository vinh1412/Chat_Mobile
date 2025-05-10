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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import IconA from "react-native-vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { search } from "../store/slice/userSlice";
import { sendReq, checkFriendStatus } from "../store/slice/friendSlice";
import { createConversation, getAllConversationsByUserId } from "../store/slice/conversationSlice"
import { checkFriend } from "../api/friendApi";
import { Alert } from "react-native";

const { width } = Dimensions.get("window"); // Lấy kích thước màn hình

  // Danh sách liên hệ gần đây
  const recentContacts = [
    {
      id: "1",
      name: "Chim rừng kêu trong m...",
      image: "https://i.pravatar.cc/300?img=3",
    },
    { id: "2", name: "Mc", image: "https://i.pravatar.cc/300?img=4" },
    {
      id: "3",
      name: "Đào Văn Thái Kiệt",
      image: "https://i.pravatar.cc/300?img=5",
    },
    { id: "4", name: "MỆIU", image: "https://i.pravatar.cc/300?img=6" },
  ];

  // Các mục truy cập nhanh
  const quickAccess = [
    { id: "1", name: "Ví QR", icon: "qr-code" },
    { id: "2", name: "Zalo Video", icon: "videocam" },
    { id: "3", name: "Thêm", icon: "add-circle" },
  ];

  // Lịch sử tìm kiếm
  const searchHistory = ["ch", "0869188794", "thái", "mẹ", "sinh"];

const ItemSerch = ({item, isFriend, isSuccessSent, sendRequest, getChat}) => {

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

                  <TouchableOpacity  style={{fontSize: '12px', padding: '4px 8px', backgroundColor: '#D6E9FF', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10}} onPress={() => {sendRequest(item?.id)}}>
                      <Text style={{color: "#006AF5"}}>Kết bạn</Text>
                  </TouchableOpacity>
              
          ): (<View></View>)}
          
      </TouchableOpacity>
  )
}

const FindInfo = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { searchResults, user } = useSelector((state) => state.user);
  const { isSuccess, error } = useSelector((state) => state.friend);

  const { conversation, conversations } = useSelector((state) => state.conversation);
  console.log("isSuccess", isSuccess);
  console.log("error", error);
  // console.log("conversation", conversation);


  const [searchText, setSearchText] = useState("");
  const [friendStatus, setFriendStatus] = useState({}); 

  console.log("searchText", searchText);

  const result = useMemo(() => {
    if (searchResults === null || searchText.trim() === "") return [];
    return searchResults?.filter((item) => item?.id !== user?.id); // Loại bỏ người dùng hiện tại khỏi danh sách kết quả
  }, [searchResults]);

  console.log("result", result);

  // Kiểm tra trạng thái bạn bè
  useEffect(() => {
    const checkIsFriend = async () => {
      if (!result || result.length === 0) return;

      const statusUpdates = {};
      for (const item of result) {
        try {
          const response = await dispatch(checkFriendStatus(item?.id)).unwrap();
          statusUpdates[item?.id] = response; 
        } catch (error) {
          console.log(`Lỗi khi kiểm tra trạng thái bạn bè cho ${item?.id}:`, error);
          statusUpdates[item?.id] = false; 
        }
      }
      setFriendStatus((prev) => ({ ...prev, ...statusUpdates }));
    };

    checkIsFriend();
  }, [result, dispatch]);


  // Xu lý tìm kiếm
  const handleSearch = async (keyword) => {
    if (keyword.trim() === "") return; // Nếu không có từ khóa thì không làm gì cả
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

    try {
      const response = await dispatch(sendReq(friendId)).unwrap();
      console.log("response", response);
      if (response.status === "SUCCESS") {
        console.log("Lời mời kết bạn đã được gửi thành công.");
        Alert.alert(
          "Thông báo",
          "Lời mời kết bạn đã được gửi thành công.",
          [{ text: "OK" }],
          { cancelable: false }
        );
      } else {
        console.log("Không thể gửi lời mời kết bạn.");
      }
    } catch (error) {
      console.log("Lỗi khi gửi lời mời kết bạn:", error);
      Alert.alert(
        "Thông báo",
        error || "Không thể gửi lời mời kết bạn.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    }
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
          <Text style={styles.sectionTitle}>Liên hệ đã tìm</Text>
          <FlatList
            horizontal
            data={recentContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContact}
          />

          <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
          <View style={styles.quickAccessContainer}>
            {quickAccess.map((item) => (
              <TouchableOpacity key={item.id} style={styles.quickAccessItem}>
                <Icon name={item.icon} size={40} color="#007AFF" />
                <Text style={styles.quickAccessText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Từ khóa đã tìm</Text>
          <FlatList
            data={searchHistory}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderHistory}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={<View style={{ height: 80 }} />} // Chừa vùng trống
          />

          <TouchableOpacity>
            <Text style={styles.editHistoryText}>
              Chỉnh sửa lịch sử tìm kiếm &gt;
            </Text>
          </TouchableOpacity>
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
              ItemSerch({item, 
                sendRequest: (id) => handleSendRequest(id), 
                isSuccessSent: isSuccess, 
                isFriend: friendStatus[item?.id],
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
