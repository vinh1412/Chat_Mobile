import React, { useCallback, useState, useMemo,useEffect } from "react";
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
} from "react-native";
import Header from "../components/Header";
import ConservationList from "../components/ConservationList";
import TabTopCategoryChat from "../navigation/TabTopCategoryChat";
import IconA from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import PhoneInput from "react-native-phone-input";
import { useDispatch, useSelector } from "react-redux";
import { search } from "../store/slice/userSlice";
import { checkFriendStatus, getReqsReceived, getReqsSent } from '../store/slice/friendSlice'
import { sendRequestToWebSocket } from "../config/socket";

const { width, height } = Dimensions.get("window");

const ItemSearch = ({item, isFriend, sendRequest, isSentReq, isReceivedReq, user}) => {
  return (
    <TouchableOpacity key={item?.id}
      style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 20}}
      onPress={() => {}}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Image source={{ uri: item?.avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} />
        <Text style={{marginLeft: 8, fontSize: 16}}>{item?.display_name}</Text>
      </View>

      {item?.id !== user?.id && (

        !isFriend ? (
          <TouchableOpacity 
            style={{fontSize: '12px', padding: '4px 8px', backgroundColor: (isSentReq || isReceivedReq) ? "#E9EBED" : '#D6E9FF', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10}} 
            onPress={() => {sendRequest(item?.id)}} 
            disabled={isSentReq || isReceivedReq }
          >
            {isSentReq ? (
              <Text style={{ color: "#141415" }}>Đã gửi lời mời</Text>
            ) : isReceivedReq ? (
              <Text style={{ color: "#141415" }}>Phản hồi</Text>
            ) : (
              <Text style={{ color: "#006AF5" }}>Kết bạn</Text>
            )}
          </TouchableOpacity>
        ): (<View></View>)
      )}

    </TouchableOpacity>
  )
}

const AddFriendScreen = () => {

  const dispatch = useDispatch();
  const { searchResults, user } = useSelector((state) => state.user);
  const { isSuccess, error, receivedFriendRequests, sentRequests } = useSelector((state) => state.friend);

  const [phone, setPhone] = useState("");
  const isButtonEnabled = phone.trim() !== "";

  const [isFriend, setIsFriend] = useState({});
  const [isSentReq, setIsSentReq] = useState({});
  const [isReceivedReq, setIsReceivedReq] = useState({});  


  const result = useMemo(() => {
      if (!Array.isArray(searchResults) || phone.trim() === "") {return []};
      return searchResults;
  }, [searchResults]);

  const requestsReceived = useMemo(() => {
    if(receivedFriendRequests === null) return [];
    return receivedFriendRequests;
  }, [receivedFriendRequests]);

  const requestsSent = useMemo(() => {
    if(sentRequests === null) return [];
    return sentRequests;
  }, [sentRequests]);  

  const handleSearch = async (keyword) => {
    if (keyword.trim() === "") {
      return; // Nếu không có từ khóa thì không làm gì cả
    }
    
    try {
      keyword = keyword.replace(/\s+/g, '').replace('+', '')
      console.log(keyword)
      const response = await dispatch(search(keyword)).unwrap();
      if (response?.status === "SUCCESS") {
        console.log("Kết quả tìm kiếm:", response.response);
      } else {
        console.log("Không tìm thấy kết quả nào.");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
    setPhone("");

  };4

  useEffect(() => {
        dispatch(getReqsReceived());
  }, []);

  useEffect(() => {
        dispatch(getReqsSent());
  }, []);  

  //Kiem tra ban be
  useEffect(() => {
    const checkFriend = async () => {
      if (!result || result.length === 0) return;
      const statusFriend = {};
      for(const item of result) {
        try {
          const response = await dispatch(checkFriendStatus(item?.id)).unwrap();
          statusFriend[item?.id] = response;
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
      };
      setIsFriend((prev) => ({...prev, ...statusFriend}));
    }
    checkFriend();
  }, [result])


  // handle gửi lời mời kết bạn
  const handleSendRequest = async (friendId) => {
      sendRequestToWebSocket({ receiverId: friendId });
      setIsSentReq((prev) => ({ ...prev, [friendId]: true }));
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Input Phone Number */}
      <View style={{ backgroundColor: "white", padding: 15 }}>
        <Text style={{ color: "#a0a0a0", paddingBottom: 10 }}>
          Nhập số điện thoại để tìm bạn bè
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          
          <PhoneInput
            style={styles.phoneInput}
            initialCountry="vn"
            autoFormat={true}
            autoValidation={true}
            textStyle={{ fontSize: 16, color: "#767A7F" }}
            onChangePhoneNumber={(phone) => setPhone(phone)}
            textProps={{
              placeholder: "Nhập số điện thoại",
            }}
          />
          <TouchableOpacity
            style={{
              backgroundColor: isButtonEnabled ? "#006AF5" : "#B9BDC1",
              padding: 10,
              borderRadius: 22,
            }}

            disabled={!isButtonEnabled}
            onPress={() => handleSearch(phone)}
          >
            <IconA
              name="arrowright"
              size={24}
              color={isButtonEnabled ? "#B9BDC1" : "#767A7F"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-add" size={24} color="#0250B6" />
          <Text style={styles.menuText}>Lời mời kết bạn đã gửi</Text>
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: "white", padding: 15, marginTop: 10 }}>
        {result.length === 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Không có kết quả nào được tìm thấy</Text>
          </View>
        ) : (
            <FlatList
              data={result}
              keyExtractor={(item) => item?.id}
              renderItem={({ item }) =>
                ItemSearch({
                  item,
                  sendRequest: (id) => handleSendRequest(id),
                  isFriend: isFriend[item?.id],
                  isSentReq: isSentReq[item?.id],
                  isReceivedReq: isReceivedReq[item?.id],
                  user
                })}
            />
        )}      
      </View>

      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F6",
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
  phoneInput: {
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#D6D9DC",
    width: width * 0.8,
  },
});
export default AddFriendScreen;
