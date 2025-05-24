import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import ActionSheet from "react-native-actions-sheet";
import { useDispatch, useSelector } from "react-redux";
import { leaveGroupThunk } from "../store/slice/messageSlice";

import {getLinkGroup} from "../api/qaCode";
import {
  updateGroupMembers,
  dissolveGroup,
  removeConversation,
} from "../store/slice/conversationSlice";
import Loading from "../components/Loading";

const GroupSettingsScreen = ({ navigation, route }) => {
  const { conversation } = route.params;
  const { user } = useSelector((state) => state.user);

  const actionSheetRef = React.useRef(null);
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const [isPinned, setIsPinned] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const isAdmin = useMemo(() => {
    const currentMember = conversation?.members?.find(
      (member) => member.id === user?.id
    );
    return currentMember?.role === "ADMIN";
  }, [conversation?.members, user?.id]);

  const clearChatHistory = () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa lịch sử trò chuyện?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        onPress: () => console.log("Xóa lịch sử trò chuyện"),
      },
    ]);
  };

  const handleActionSheet = () => {
    console.log("ActionSheet opened");
    actionSheetRef.current?.show();
  };

  const handleLeaveGroup = () => {
    setIsLoading(true);
    try {
      dispatch(leaveGroupThunk(conversation?.id));

      dispatch(
        updateGroupMembers({
          conversationId: conversation?.id,
          members: conversation?.members?.filter(
            (member) => member?.id !== user?.id
          ),
        })
      );

      console.log("Rời nhóm thành công");
      navigation.replace("Main");
      actionSheetRef.current?.hide();
    } catch (error) {
      console.error("Error leaving group:", error);
    } finally {
      setIsLoading(false);
    }
    actionSheetRef.current?.hide();
  };

  const handleDissolveGroup = () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa nhóm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        onPress: () => {
          setIsLoading(true);
          try {
            dispatch(dissolveGroup(conversation?.id));

            console.log("Giải tán nhóm thành công");
            navigation.replace("Main");
          } catch (error) {
            console.error("Error dissolving group:", error);
            Alert.alert(
              "Lỗi",
              "Không thể giải tán nhóm. Vui lòng thử lại sau."
            );
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  // xu ly lay link group
  const handleGetLinkGroup = async () => {
    try {
      const linkGroup = await getLinkGroup(conversation?.id);
      console.log("Link nhóm:", linkGroup);
      Alert.alert("Link nhóm", linkGroup, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    } catch (error) {
      console.error("Lỗi lấy link nhóm:", error);
    }
  };
  

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Ảnh đại diện + Tên nhóm */}
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: "https://avatars.githubusercontent.com/u/100653357?v=4",
            }}
            style={styles.avatarContainer}
          />
          <Text style={styles.name}>{conversation?.name}</Text>
        </View>

        {/* Các tùy chọn chính */}
        <View style={styles.optionsRow}>
          <OptionButton color="black" icon="search" text="Tìm tin nhắn" />
          <OptionButton
            color="black"
            icon="user-plus"
            text="Thêm thành viên"
            onPress={() =>
              navigation.navigate("CreateGroupScreen", {
                nextScreen: "DetailGroupChatScreen",
                conversation: conversation,
              })
            }
          />
          <OptionButton color="black" icon="image" text="Đổi hình nền" />
          <OptionButton color="black" icon="bell-off" text="Tắt thông báo" />
        </View>

        {/* Danh sách tùy chọn */}
        <OptionRow color="black" icon="folder" text="Ảnh, file, link" />
        <OptionRow color="black" icon="calendar" text="Lịch nhóm" />
        <OptionRow color="black" icon="bookmark" text="Tin nhắn đã ghim" />
        <OptionRow color="black" icon="bar-chart-2" text="Bình chọn" />
        <OptionRow
          color="black"
          icon="users"
          text={`Xem thành viên (${conversation?.members.length})`}
          onPress={() =>
            navigation.navigate("MemberGroupScreen", {
              members: conversation?.members,
              conversationId: conversation?.id,
            })
          }
        />
        <OptionRow
          color="black"
          icon="link"
          text="Link nhóm"
          onPress={async () => {
            try {
              const linkGroup = await getLinkGroup(conversation?.id);
              console.log("Link nhóm:", linkGroup);
              navigation.navigate("JoinGroupQR", { linkGroup, idconversation: conversation?.id });  
            } catch (error) {
              console.error("Lỗi lấy link nhóm:", error);
            }
          }}
        />


        {/* in ra conversation?.linkGroup */}
        {/* Ghim trò chuyện */}
        {/* <SettingToggle
                    label="Ghim trò chuyện"
                    value={isPinned}
                    onChange={setIsPinned}
                /> */}
        {/* Ẩn trò chuyện */}
        {/* <SettingToggle
                    label="Ẩn trò chuyện"
                    value={isMuted}
                    onChange={setIsMuted}
                /> */}
        {/* Rời nhóm & Xóa lịch sử trò chuyện */}
        {isAdmin && (
          <OptionRow
            icon="user-check"
            text="Chuyển quyền trưởng nhóm"
            onPress={() => {
              Alert.alert("Chuyển quyền nhóm trưởng", "Bạn có chắc chuyển quyền không? Khi chuyển bạn sẽ mất các quyền quản lý.", [
                {
                  text: "Hủy",
                  onPress: () => {
                  },
                  style:'cancel'
                },
                {
                  text: "Xác nhận",
                  onPress: () => {
                    navigation.navigate('ChooseLeaderScreen', {conversationId: conversation?.id, members: conversation?.members.filter((member) => member.role === "MEMBER")})
                  },
                  style:'default'
                }
              ])
            }}
            color="black"
          />
        )}
        <OptionRow
          icon="log-out"
          text="Rời nhóm"
          onPress={handleActionSheet}
          color="red"
        />
        <OptionRow
          icon="trash-2"
          text="Xóa lịch sử trò chuyện"
          onPress={clearChatHistory}
          color="red"
        />
        {isAdmin && (
          <OptionRow
            icon="trash-2"
            text="Giải tán nhóm"
            onPress={handleDissolveGroup}
            color="red"
          />
        )}

        <ActionSheet ref={actionSheetRef} gestureEnabled={true}>
          <View style={{ padding: 20 }}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Rời nhóm
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              Bạn có chắc muốn rời nhóm này?
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: "red", padding: 15, borderRadius: 10 }}
              onPress={() => {
                console.log("Confirmed leaving group"), handleLeaveGroup();
              }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                Xác nhận
              </Text>
            </TouchableOpacity>
          </View>
        </ActionSheet>
      </View>

      <Loading isLoading={isLoading} />
    </ScrollView>
  );
};

// Component hiển thị tùy chọn
const OptionButton = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.optionButton} onPress={onPress}>
    <Feather name={icon} size={22} color="black" />
    <Text style={styles.optionText}>{text}</Text>
  </TouchableOpacity>
);

const OptionRow = ({ icon, text, color, onPress }) => (
  <TouchableOpacity style={styles.optionRow} onPress={onPress}>
    <Feather name={icon} size={20} color={color} style={styles.optionIcon} />
    <Text style={[styles.optionText, { color: color }]}>{text}</Text>
  </TouchableOpacity>
);

// Component toggle bật/tắt
const SettingToggle = ({ label, value, onChange }) => (
  <View style={styles.optionRow}>
    <Text style={styles.optionText}>{label}</Text>
    <Switch value={value} onValueChange={onChange} />
  </View>
);

// 🌟 Style CSS
const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: "#ffff",
  },
  profileHeader: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  optionsRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    padding: 10,
  },
  optionButton: {
    alignItems: "center",
    // padding: 10,
  },
  optionText: {
    color: "black",
    fontSize: 14,
    marginTop: 5,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F5F6",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 15,
    gap: 10,
  },
  optionIcon: {
    marginRight: 10,
  },
});

export default GroupSettingsScreen;
