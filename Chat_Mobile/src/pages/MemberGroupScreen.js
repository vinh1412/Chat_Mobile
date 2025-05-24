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
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import IconA from "react-native-vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { sendReq, checkFriendStatus } from "../store/slice/friendSlice";
import { removeMemberGroupThunk } from "../store/slice/messageSlice";
import { updateGroupMembers } from "../store/slice/conversationSlice";
import ItemMember from "../components/ItemMember";
import ActionSheet from "react-native-actions-sheet";
import Loading from "../components/Loading";

const { width } = Dimensions.get("window");

const MemberGroupScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const actionSheetRef = React.useRef(null);

  const { user } = useSelector((state) => state.user);
  const { isSuccess, error } = useSelector((state) => state.friend);
  const { membersGroup } = useSelector((state) => state.conversation);

  const { members: initialMembers, conversationId } = route.params;

  // State cục bộ để quản lý danh sách members
  const [members, setMembers] = useState(initialMembers || []);
  const [searchText, setSearchText] = useState("");
  const [friendStatus, setFriendStatus] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // loading
  const [loading, setLoading] = useState(false);
  

  // Đồng bộ members khi route.params.members thay đổi
  useEffect(() => {
    setMembers(initialMembers || []);
  }, [initialMembers]);

  // Kiểm tra trạng thái bạn bè
  useEffect(() => {
    const checkIsFriend = async () => {
      if (!members || members.length === 0) return;

      const statusUpdates = {};
      for (const item of members) {
        try {
          if (item?.id === user?.id) continue; // Bỏ qua chính mình
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
  }, [members, dispatch]);

  // Xử lý tìm kiếm
  const handleSearch = async (keyword) => {
    console.log("keyword", keyword);
  };

  useEffect(() => {
    if (searchText) {
      handleSearch(searchText);
    }
  }, [searchText]);

  // Handle gửi lời mời kết bạn
  const handleSendRequest = async (friendId) => {
    setLoading(true);
    try {
        const response = await dispatch(sendReq(friendId)).unwrap();
        if (response.status === "SUCCESS") {
            Alert.alert(
            "Thông báo",
            "Lời mời kết bạn đã được gửi thành công.",
            [{ text: "OK" }],
            { cancelable: false }
            );
        }
    } catch (error) {
        console.log("Lỗi khi gửi lời mời kết bạn:", error);
        Alert.alert(
            "Thông báo",
            error || "Không thể gửi lời mời kết bạn.",
            [{ text: "OK" }],
            { cancelable: false }
        );
    } finally {
        setLoading(false);
    }
  };

  // Handle xóa thành viên ra khỏi nhóm
  const handleRemoveMember = (memberId) => {

      Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm không?",
        [
          {
            text: "Hủy",
            onPress: () => console.log("Hủy"),
            style: "cancel",
          },
          {
            text: "Xóa",
            onPress: async () => {
              setLoading(true);
              try {
                // Gọi API để xóa thành viên
                await dispatch(removeMemberGroupThunk({ conversationId, memberId })).unwrap();

                // Cập nhật state cục bộ
                const updatedMembers = members.filter((member) => member?.id !== memberId);
                setMembers(updatedMembers);

                // Cập nhật Redux store
                dispatch(
                  updateGroupMembers({
                    conversationId,
                    members: updatedMembers,
                  })
                );

                Alert.alert(
                  "Thông báo",
                  "Xóa thành viên thành công.",
                  [{ text: "OK" }],
                  { cancelable: false }
                );
                navigation.replace('Main');

              } catch (error) {
                console.error("Error removing member:", error);
                Alert.alert(
                  "Thông báo",
                  error.message || "Không thể xóa thành viên khỏi nhóm.",
                  [{ text: "OK" }],
                  { cancelable: false }
                );
              } finally {
                setLoading(false);
              }
            },
            style: "default",
          },
        ]
      );
    
    actionSheetRef.current?.hide();
  };

  return (
    <View style={{ flex: 1 }}>
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
          {showSearch && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between', marginLeft: 10 }}>
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
              {searchText.trim() && (
                <IconA name="close" size={24} color="#fff" onPress={() => { setShowSearch(false); setSearchText(""); }} />
              )}
            </View>
          )}
          {!showSearch && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between', marginLeft: 10, width: '90%' }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                Thành viên
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 25 }}>
                <IconA
                  name="addusergroup"
                  size={24}
                  color="#fff"
                  onPress={() => { console.log("Xử lý thêm thành viên"); }}
                />
                <IconA
                  name="search1"
                  size={24}
                  color="#fff"
                  onPress={() => setShowSearch(true)}
                />
              </View>
            </View>
          )}
        </LinearGradient>

        <View>
          <Text style={styles.sectionTitle}>
            Thành viên ({members.length})
          </Text>
          <FlatList
            data={members}
            keyExtractor={(item) => item?.id}
            renderItem={({ item }) =>
              ItemMember({
                item,
                sendRequest: (id) => handleSendRequest(id),
                isSuccessSent: isSuccess,
                isFriend: friendStatus[item?.id],
                userId: user?.id,
                navigation: navigation,
                setSelectedMember: setSelectedMember,
                actionSheetRef: actionSheetRef,
              })
            }
          />
          {selectedMember && (
            <ActionSheet ref={actionSheetRef} containerStyle={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
              <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} key={selectedMember?.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', paddingVertical: 15 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', width: '90%' }}>Thông tin thành viên</Text>
                  <IconA name="close" size={24} color="#000" style={{ width: '10%' }} onPress={() => { actionSheetRef.current?.hide(); }} />
                </View>

                <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Image source={{ uri: selectedMember?.avatar }} style={styles.contactImage} />
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{selectedMember?.display_name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity
                      style={{ padding: 10, backgroundColor: '#D6E9FF', borderRadius: 24 }}
                      onPress={() => { console.log("Call", selectedMember?.id); }}
                    >
                      <Icon name="call-outline" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ padding: 10, backgroundColor: '#D6E9FF', borderRadius: 24 }}
                      onPress={() => { console.log("Chat"); }}
                    >
                      <Icon name="chatbubble-ellipses-outline" size={20} color="#000" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ padding: 20 }}>
                  <TouchableOpacity
                    style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                    onPress={() => { actionSheetRef.current?.hide(); }}
                  >
                    <IconA name="user" size={24} color="#000" />
                    <Text style={{ fontSize: 15 }}>Xem thông tin</Text>
                  </TouchableOpacity>

                  {selectedMember?.role === "MEMBER" && (
                    <View>
                      <TouchableOpacity
                        style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                        onPress={() => { actionSheetRef.current?.hide(); }}
                      >
                        <Icon name="shield-outline" size={24} color="#000" />
                        <Text style={{ fontSize: 15 }}>Bổ nhiệm</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                        onPress={() => { handleRemoveMember(selectedMember?.id); }}
                      >
                        <IconA name="deleteusergroup" size={24} color="red" />
                        <Text style={{ fontSize: 15, color: 'red' }}>Xóa khỏi nhóm</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </ActionSheet>
          )}
        </View>
      </View>
      <Loading isLoading={loading} />
    </View>
  );
};

// Styles không thay đổi, giữ nguyên
const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: StatusBar.currentHeight + 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 10,
    width: "90%",
  },
  searchInput: {
    color: "#fff",
    paddingVertical: 5,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    marginHorizontal: 15,
  },
  contactImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default MemberGroupScreen;