import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  Alert
} from "react-native";
import Header from "../components/Header";
import ConservationList from "../components/ConservationList";
import TabTopCategoryChat from "../navigation/TabTopCategoryChat";
import IconA from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import PhoneInput from "react-native-phone-input";
import { useSelector, useDispatch } from "react-redux";
import { getMyFriends } from "../store/slice/friendSlice";
import { createConversationGroup, getAllConversationsByUserId, setConversationsGroup, updateGroupMembers } from "../store/slice/conversationSlice";
import { addMemberGroupThunk } from "../store/slice/messageSlice";
import Icon from "react-native-vector-icons/AntDesign";
import Loading from "../components/Loading";
// import { connectWebSocket, disconnectWebSocket } from "../config/socket";

const { width, height } = Dimensions.get("window");

const CreateGroupScreen = ({navigation, route}) => {
  const dispatch = useDispatch();

  const nextScreen  = route.params?.nextScreen;

  const conversation = route.params?.conversation || null;

  console.log("nextScreen", nextScreen);

  const { friends } = useSelector((state) => state.friend);
  const friendMemo = useMemo(() => {
    if(!friends) return [];
    return friends;
  },[friends]);

  const [phone, setPhone] = useState("");
  const [nameGroup, setNameGroup] = useState("");
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const { user } = useSelector((state) => state.user);

  //loading
  const [isLoading, setIsLoading] = useState(false);

  // console.log("search ", search);

  console.log("selectedContacts", selectedContacts);
  
  const isButtonEnabled = search.trim() !== "";
  

  useEffect(() => {
    setSelectedContacts([]);
    dispatch(getMyFriends());
  }, [dispatch]);

  const toggleSelect = (item) => {
    if(selectedContacts.includes(item)) return;
    setSelectedContacts((prev) =>
      prev.includes(item.userId) ? prev.filter((contact) => contact.userId !== item.userId) : [...prev, item]
    );
  };

  const filteredContacts = friendMemo?.filter((contact) =>
      contact?.displayName?.includes(search)
  );

  console.log("filteredContacts", filteredContacts);

  // Đối với feature tạo nhóm
  const handleCreateGroup = async () => {
    const memberIds = selectedContacts.map((contact) => contact.userId);
    if(memberIds.length <= 1 ) {
      console.log("Vui lòng chọn ít nhất 2 thành viên để tạo nhóm.");
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất 2 thành viên để tạo nhóm.", [{ text: "OK" }]);
      return;
    }
    setIsLoading(true);
    
    try {
      const request = {
        name: nameGroup,
        member_id: memberIds
      };

      const response = await dispatch(createConversationGroup(request)).unwrap();
      
      navigation.replace("GroupChatScreen", { conversation: response });

      console.log("Đã cập nhật danh sách cuộc trò chuyện.");
      setSelectedContacts([]);
      setNameGroup("");

    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Lỗi", "Không thể tạo cuộc trò chuyện. Vui lòng thử lại.", [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }

    
  }

  // Đối với feature add thêm thành viên vào nhóm
  const checkExistMember = (memberId) => {
    if(!conversation) return;
    const member = conversation?.members?.find((member) => member?.id === memberId);
    return member ? true : false;
  }

  const handleAddMember = async () => {
    if(!conversation) return;
    const memberId = selectedContacts.map((contact) => contact.userId);
    if(memberId.length <= 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất 1 thành viên để thêm vào nhóm.", [{ text: "OK" }]);
      return;
    }

    setIsLoading(true);

    try {
      await dispatch(addMemberGroupThunk({conversationId: conversation?.id, memberId})).unwrap();
    
      dispatch(updateGroupMembers({
        conversationId: conversation?.id,
        members: selectedContacts
      }))

      navigation.replace('Main');
    } catch (error) {
      
      console.error("Error adding members:", error);
      Alert.alert("Lỗi", "Không thể thêm thành viên vào nhóm. Vui lòng thử lại.", [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  }

//   React.useEffect(() => {
//     if(!user?.id) return;

//     console.log("User ID:-------- ", user?.id);

//     connectWebSocket(() => {
//         subscribeToConversation(user?.id, (message) => {
//             dispatch(setConversationsGroup(message));
//         })
//     });

//     return () => {
//         disconnectWebSocket();
//     }
// }, [user?.id]);

  return (
    <SafeAreaView style={{flex:1}}>

      <View style={styles.container}>

        <View style={{ backgroundColor: "white"}}>
          {/* Khu vực đặt tên nhóm đối với feature tạo nhóm */}
          {nextScreen === "ConversationList" && (

            <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center", padding: 15, gap: 10}}>

                <TouchableOpacity style={{paddingHorizontal: 10}}>
                    <IconA name="camera" size={30} color="black" />
                </TouchableOpacity>

                <View style={{ flexDirection: "row", alignItems: "center", gap:15}}>
                    <TextInput
                        style={styles.nameGrInput}
                        placeholder="Đặt tên nhóm"
                        value={nameGroup}
                        onChangeText={(text) => setNameGroup(text)}

                    />
                    
                    <TouchableOpacity>
                        <IconA name="close" size={24} color="black" onPress={() => setNameGroup("")}/>
                    </TouchableOpacity>
                </View>
            </View>
          )}

          {/* Khu vực tìm kiếm */}
          <View style={{ padding: 15}}>
              <View style={{ backgroundColor:'#E9EBED',flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, padding:3, borderRadius:8}}>
                <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center", gap: 10}}>

                  <IconA name="search1" size={24} color="#767A7F"  style={{paddingHorizontal: 10}}/>
                      <TextInput
                          placeholder="Tìm tên hoặc số điện thoại"
                          placeholderTextColor={"#767A7F"}
                          style={styles.search}
                          value={search}
                          onChangeText={setSearch}
                      />
                </View>
                {isButtonEnabled && (
                  <TouchableOpacity style={{paddingHorizontal: 10}} onPress={() => setSearch("")}>
                      <IconA name="close" size={24} color="black" />
                  </TouchableOpacity>
                )}
              </View>
          </View>
        </View>

        <View style={{ flex: 1, backgroundColor: "white"}}>
          <Text style={{paddingVertical: 10, paddingLeft: 20, color: "gray"}}>Đã chọn ({selectedContacts.length})</Text>
          {/* Hiển thị danh sách bạn bè */}
          <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item?.userId||Math.random().toString()}
              renderItem={({ item }) => (

                <TouchableOpacity key={item?.userId} style={styles.contactItem} 
                  onPress={() => toggleSelect(item)} 
                  disabled={nextScreen === "DetailGroupChatScreen" && checkExistMember(item?.userId)}
                >
                    <Image source={{ uri: item?.avatar }} style={styles.avatar} />
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{item?.displayName}</Text>
                        {/* <Text style={styles.lastSeen}>{item?.lastSeen || ""}</Text> */}
                    </View>

                    {/* Nếu là add tv thì check thành viên */}
                    {nextScreen === "DetailGroupChatScreen" && checkExistMember(item?.userId) ? (

                      <Text style={styles.lastSeen}>Đã tham gia</Text>

                    ): (
                      <View style={selectedContacts.includes(item) ? styles.selectedCircle : styles.unselectedCircle} />
                    )}
                </TouchableOpacity>

              )}
          />

          {/* Button add */}
          {selectedContacts.length > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingVertical:5, backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#E9EBED"}}>
              <FlatList
                data={selectedContacts}
                keyExtractor={(item)=> item?.userId}
                renderItem={({item}) => (

                  <TouchableOpacity key={item?.userId} style={{}} 
                    onPress={()=> {setSelectedContacts(selectedContacts.filter((contact) => contact.userId !== item.userId))}}
                  >
                      <Image source={{ uri: item?.avatar }} style={styles.avatar} />
                      <IconA name="close" size={14} color="black" style={{position:'absolute', right:11, padding:2,borderWidth:2, borderRadius:16,borderColor:'white', backgroundColor:'gray'}}/>

                  </TouchableOpacity>

                )}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              />

              <IconA name="play" size={40} color="#006AF5" style={{padding: 10}} 
                onPress={() => {
                  // Nếu là tạo nhóm thì gọi hàm tạo nhóm
                  nextScreen === "ConversationList" ? handleCreateGroup() : 

                  handleAddMember()
                  
                }}
              />

            </View>
          )}
          </View>
      </View>
      
      <Loading isLoading={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F4F5F6",
    flex:2
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginTop: 10,
    gap: 10,
    borderRadius: 8,
  },
  menuText: {
    color: "black",
    fontSize: 16,
  },
  nameGrInput: { fontSize:15,borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#D6D9DC", width: width * 0.7},
  search: {
    color: "#767A7F",
    paddingBottom: 5,
    fontSize: 16,
    height: width * 0.08,
    width: width * 0.5,
    borderRadius: 8,
    
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E9EBED",
  },
  avatar: { width: 45, height: 45, borderRadius: 20, marginRight: 10 },
  contactInfo: { flex: 1 },
  contactName: { color: "black", fontSize: 16 },
  lastSeen: { color: "gray", fontSize: 12 },
  selectedCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#006AF5" },
  unselectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "gray",
  },
});
export default CreateGroupScreen;
