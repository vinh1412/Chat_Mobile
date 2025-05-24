import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import IconF6 from "react-native-vector-icons/FontAwesome6";
import IconA from "react-native-vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import { getMyFriends, setFriends, unfriend, setFriends_Unfriend } from "../store/slice/friendSlice";
import { createConversation, getAllConversationsByUserId } from "../store/slice/conversationSlice"
import { subscribeFriendsToAcceptFriendRequest, connectWebSocket, disconnectWebSocket, subscribeFriendsToUnfriend } from "../config/socket";

import Loading from "./Loading";

const { width, height } = Dimensions.get("window");

const PhoneBookFriend = ({navigation}) => {
  const dispatch = useDispatch();
  const  { friends, isLoading }  = useSelector((state) => state.friend);
  const { conversations } = useSelector((state) => state.conversation);
  const { user } = useSelector((state) => state.user);
  

  console.log("friends", friends);
  console.log("isLoading", isLoading);

  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // const filteredContacts = friends.filter((contact) =>
  //   contact.displayName.toLowerCase().includes(searchText.toLowerCase())
  // );

  React.useEffect(() => {

    connectWebSocket(() => {

      // accept friend request
      subscribeFriendsToAcceptFriendRequest(user?.id, (message) => {
        console.log("Nhận được tin nhắn từ WebSocket:", message);
        dispatch(setFriends(message));
      });

      // unfriend
      subscribeFriendsToUnfriend(user?.id, (message) => {
        console.log("Nhận được tin nhắn từ WebSocket unfriend:", message);
        dispatch(setFriends_Unfriend(message));
      });
    });

    return () => {
      disconnectWebSocket();
    };
  },[user?.id]);

  React.useEffect(() => {
    dispatch(getMyFriends());
  }
  , [dispatch]);

  // tao cuoc tro chuyen 
  const handleCreateConversation = async (item) => {
    
    if(!item?.userId || !item) return;

    try {
      if(Array.isArray(conversations)) {

        for ( const conversation of conversations) {
          const userReceived = conversation?.members.find((member) => member?.id === item?.userId);
  
          if(userReceived) {
            console.log("Cuộc trò chuyện đã tồn tại");
  
            navigation.navigate("SingleChatScreen", { conversationId: conversation?.id, userReceived: userReceived });
  
            return;
          }
        }
      }

      const request = {
        is_group: false,
        member_id: [item?.userId],
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

  const handleUnfriend = async (friendId) => {
    try {
      Alert.alert(`Xóa bạn với ${selectedFriend?.displayName}?`, `Bạn có chắc chắn muốn xóa ${selectedFriend?.displayName} không?`, [
        {
          text: "Hủy",
          onPress: () => console.log("Hủy"),
          style: "cancel",
        },
        {
          text: "Xóa",
          onPress: async () => {
            await dispatch(unfriend(friendId)).unwrap();
            console.log("Đã xóa bạn thành công");
            setModalVisible(false);
          },
          style: "default",
        }
      ])
    } catch (error) {
      console.log("Lỗi khi xóa bạn:", error);
    }
  }

  return (
    <>
      <View style={styles.container}>


        {/* Danh mục */}
        <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => {navigation.navigate("TabTopFriendRequest")}}>
          <View style={styles.iconContainer}>
            <Icon name="user-plus" size={20} color="#007AFF" style={styles.icons}/>
          </View>
          <Text style={styles.menuText}>Lời mời kết bạn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconContainer}>
            <Icon name="address-book" size={20} color="#34C759" style={styles.icons}/>
          </View>
          <View>
            <Text style={styles.menuText}>Danh bạ máy</Text>
            <Text style={styles.subText}>Các liên hệ có dùng Zalo</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconContainer}>
            <Icon name="gift" size={20} color="#FF9500" style={styles.icons}/>
          </View>
          <Text style={styles.menuText}>Sinh nhật</Text>
        </TouchableOpacity>
      </View>
        {/* Thanh phân cách */}
        <View style={styles.separator} />

        {/* Danh sách bạn bè */}
        <FlatList
          data={friends.filter((friends) =>  friends !== null)}
          keyExtractor={(item) => item?.userId}
          renderItem={({ item }) => (
            <TouchableOpacity key={item?.userId} style={styles.contactItem} 
              onPress={() => handleCreateConversation(item)}
              onLongPress={() => {
                console.log("Long Pressed:", item);
                setSelectedFriend(item);
                setModalVisible(true);
              }}
            >
              <Image source={{uri:item?.avatar}} style={styles.avatar} />
              <Text style={styles.contactName}>{item?.displayName}</Text>
              <View style={styles.iconContainer}>
                <TouchableOpacity>
                  <Icon name="phone" size={20} color="#34C759" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Icon name="video-camera" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
        <Loading isLoading={isLoading} />
      </View>

      {/* Modal chi tiết bạn bè */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <IconA name="closecircleo" size={24} color="#000"
              style={{ position: "absolute", top: 10, right: 10 }}
              onPress={() => setModalVisible(false)}
            />
            <View style={{display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20}}>
              <Image
                source={{ uri: selectedFriend?.avatar }}
                style={{ width: 80, height: 80, borderRadius: 50, borderWidth: 3, borderColor: "#fff" }}
              />
               <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                {selectedFriend?.displayName}
              </Text>
            </View>

            {/* Thông tin chi tiết */}
            <View style={{display: "flex", flexDirection:'row',alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 20}}>
              <TouchableOpacity style={{backgroundColor: "#F4F5F6", padding: 10, borderRadius: 5, alignItems: "center", gap: 5, width: width*0.35, borderRadius: 12}}
                onPress={() => navigation.navigate('Profile', {userReceived: selectedFriend})}
              >
                <Icon name="user-circle-o" size={20} color="#007AFF" />
                <Text style={{color: "#000", fontSize: 12}}>Xem trang cá nhân</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{backgroundColor: "#F4F5F6", padding: 10, borderRadius: 5, alignItems: "center", gap: 5, width: width*0.35, borderRadius: 12}}>
                <IconF6 name="user-lock" size={20} color="#007AFF" />
                <Text style={{color: "#000", fontSize: 12}}>Chặn</Text>
              </TouchableOpacity>
            </View>

            {/* Thao tác với bạn bè */}            
            <View style={{display: "flex", flexDirection:'row',alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 20}}>

              <TouchableOpacity style={{backgroundColor: "#F4F5F6", paddingVertical: 5, borderRadius: 5, alignItems: "center", gap: 5, width: width*0.35, borderRadius: 12}}
                onPress={() => handleUnfriend(selectedFriend?.userId)}
              >
                <Text style={{color: "#000", fontWeight: 'bold'}}>Xóa bạn</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{backgroundColor: "#007AFF", paddingVertical: 5, borderRadius: 5, alignItems: "center", gap: 5, width: width*0.35, borderRadius: 12}}
                 onPress={() => handleCreateConversation(selectedFriend)}
              >
                <Text style={{color: "#fff", fontWeight: 'bold'}}>Nhắn tin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  menuContainer: {
    // padding: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    padding:10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    // marginRight: 220,
    // marginRight: 22,
    // padding: 5,
    gap: 5,
  },
  menuText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 10,
  },
  subText: {
    fontSize: 12,
    color: "#aaa",
    marginLeft: 10,

  },
  icons: {
    borderColor: "#000",  // Màu viền
    borderRadius:  0.3,     // Bo góc
    backgroundColor: "#006AF5", // Màu nền
    color: "#FFFFFF",     // Màu chữ (chỉ áp dụng nếu icon là một Text)
    padding: 5,          // Thêm padding để có khoảng cách xung quanh
    gap:5,
    width: 30,            // Chiều rộng của icon
    height: 30,           // Chiều cao của icon
    alignItems: "center", // Căn giữa icon theo chiều ngang
    justifyContent: "center", // Căn giữa icon theo chiều dọc
    size: 20,
},
separator: {
  height: 1,
  backgroundColor: "#ddd",
  marginVertical: 10,
},
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  contactName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  iconContainer: {
    flexDirection: "row",
    gap: 15,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    overflow: "hidden"
  }
});

export default PhoneBookFriend;
