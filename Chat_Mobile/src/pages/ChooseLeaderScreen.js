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
import { updateGroupMembers, transferLeaderThunk } from "../store/slice/conversationSlice";

import Loading from "../components/Loading";

const { width } = Dimensions.get("window");

const ChooseLeaderScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
  const { isSuccess, error } = useSelector((state) => state.friend);

  const { members: initialMembers, conversationId } = route.params;

  // State cục bộ để quản lý danh sách members
  const [members, setMembers] = useState(initialMembers || []);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // loading
  const [loading, setLoading] = useState(false);
  

  // Đồng bộ members khi route.params.members thay đổi
  useEffect(() => {
    setMembers(initialMembers || []);
  }, [initialMembers]);

  // Xử lý tìm kiếm
  const handleSearch = async (keyword) => {
    console.log("keyword", keyword);
  };

  useEffect(() => {
    if (searchText) {
      handleSearch(searchText);
    }
  }, [searchText]);


  // Handle xóa thành viên ra khỏi nhóm
  const handleUpdateRoleAdmin = (member) => {

      Alert.alert(
        `Chuyển quyền nhóm cho ${member.display_name}`,
        `${member.display_name} sẽ trở thành trưởng nhóm mới. Và bạn sẽ trở thành một thành viên bình thường`,
        [
          {
            text: "Hủy",
            onPress: () => console.log("Hủy"),
            style: "cancel",
          },
          {
            text: "Chuyển",
            onPress: async () => {
              setLoading(true);
              try {
                // Gọi API để update
                await dispatch(transferLeaderThunk({ conversationId, memberId: member?.id, requestingUserId: user?.id })).unwrap();

                Alert.alert(
                  "Thông báo",
                  "Chuyển quyền thành công.",
                  [{ text: "OK" }],
                  { cancelable: false }
                );
                navigation.replace('Main');

              } catch (error) {
                console.error("Error removing member:", error);
                Alert.alert(
                  "Thông báo",
                  error.message || "Không chuyển quyền.",
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
                Chọn nhóm trưởng mới
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
              (
                <View style={{flex: 1}} key={item?.id} >
                
                    <TouchableOpacity 
                         style={{cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0'}}
                        onPress={() => {handleUpdateRoleAdmin(item)}}
                    >
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Image source={{ uri: item?.avatar }} style={styles.contactImage} />
                            <Text style={{marginLeft: 8, fontSize: 16}}>{item?.display_name}</Text>
                        </View>
                    </TouchableOpacity>
                
                </View>
              )
            }
          />
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

export default ChooseLeaderScreen;