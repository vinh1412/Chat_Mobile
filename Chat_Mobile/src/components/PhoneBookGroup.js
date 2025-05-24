import React, {useEffect, useMemo} from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { getAllConversationsByUserId, setConversationsGroup } from "../store/slice/conversationSlice";
import { useNavigation } from "@react-navigation/native";
import { connectWebSocket, disconnectWebSocket, subscribeToConversation } from "../config/socket";

const GroupItem = ({ item }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity key={item?.id} style={styles.groupItem}
      onPress={() => {
        navigation.navigate("GroupChatScreen", { conversation: item });
      }}
    >
      <View style={styles.groupAvatars}>
        {item.members.slice(0, 4).map((member, index) => (
          <Image key={index} source={{ uri: member.avatar }} style={styles.groupAvatar} />
          ))}
        </View>

        <View style={styles.groupContent}>
          <Text style={styles.groupName}>{item?.name}</Text>
          <Text style={styles.groupMessage}>{item?.message}</Text>
        </View>

        <Text style={styles.groupTime}>{item?.time}</Text>
      </TouchableOpacity>

  )
};

const GroupList = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { conversations } = useSelector((state) => state.conversation);
  const { user } = useSelector((state) => state.user);

  const groups = useMemo(() => {
    if(Array.isArray(conversations)) {
      return conversations.filter((item) => item.is_group);
    }
    return [];
  }, [conversations]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        await dispatch(getAllConversationsByUserId()).unwrap();
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    }
    fetchConversations();
  }, []);

  useEffect(() => {
    connectWebSocket(() => {
      subscribeToConversation(user?.id, (message) => {
        if(message) {
          dispatch(setConversationsGroup(message));
        }
      });
    });
    return () => {
      disconnectWebSocket();
    }
  }, [user?.id]);


  return (
    <View style={styles.container}>
      {/* Nút tạo nhóm mới */}
      <TouchableOpacity style={styles.createGroupButton}
        onPress={() => { navigation.navigate("CreateGroupScreen", {nextScreen: 'ConversationList'}); }}
      >
        <Ionicons name="person-add-outline" size={24} color="blue" style={styles.personadd}/>
        <Text style={styles.createGroupText}>Tạo nhóm mới</Text>
      </TouchableOpacity>

      {/* Thanh phân cách */}
      <View style={styles.separator} />

      {/* Header danh sách nhóm */}
      <View style={styles.groupListHeader}>
        <Text style={styles.groupListTitle}>Nhóm đang tham gia ({groups.length})</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="swap-vertical" size={16} color="gray" />
          <Text style={styles.sortText}>Sắp xếp</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách nhóm */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GroupItem item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  createGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    // backgroundColor: "#f0f0f0",

  },
  personadd: {
    borderColor: "#000",  // Màu viền
    borderRadius: 50,     // Bo góc
    backgroundColor: "#77e1ff", // Màu nền
    color: "#FFFFFF",     // Màu chữ (chỉ áp dụng nếu icon là một Text)
    gap:15,
    padding: 15,
    alignItems: "center", // Căn giữa icon theo chiều ngang
    justifyContent: "center", // Căn giữa icon theo chiều dọc
    size: 20,

  },
  createGroupText: {
    marginLeft: 10,
    color: "#000000",
    fontSize: 16,
  },
  separator: {
    height: 3,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  groupListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  groupListTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortText: {
    marginLeft: 5,
    color: "gray",
  },
  groupItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  groupAvatars: {
    width: 53,
    height: 53,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  groupAvatar: {
    width: 21,
    height: 21,
    borderRadius: 12,
    margin: 1,
  },
  groupContent: {
    flex: 1,
    marginLeft: 13,
  },
  groupName: {
    fontWeight: "bold",
    fontSize: 17,
  },
  groupMessage: {
    color: "gray",
    fontSize: 15,
  },
  groupTime: {
    color: "gray",
    fontSize: 13,
  },
});

export default GroupList;
