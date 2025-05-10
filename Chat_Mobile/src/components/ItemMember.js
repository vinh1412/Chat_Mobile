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
import { Alert } from "react-native";

const { width } = Dimensions.get("window"); // Lấy kích thước màn hình

const ItemMember = ({item, isFriend, isSuccessSent, sendRequest, userId, navigation, setSelectedMember, actionSheetRef}) => {

    const handleSelectMember = () => {
        console.log("item", item);
        if(userId !== item?.id) {
            setSelectedMember(item);
            actionSheetRef?.current?.show();
        }
         else {
            console.log("Chọn chính mình");
            navigation.navigate("Profile");
        }
    }
    return (
        <View style={{flex: 1}} key={item?.id} >

            <TouchableOpacity 
                style={{cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0'}}
                onPress={handleSelectMember}
            >
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Image source={{ uri: item?.avatar }} style={styles.contactImage} />
                    <Text style={{marginLeft: 8, fontSize: 16}}>{item?.display_name}</Text>
                </View>
                {/* Kiem tra xem co phai ban khong */}
                {!isFriend && userId !== item?.id ? (

                        <TouchableOpacity  style={{fontSize: '12px', padding: '4px 8px', backgroundColor: '#D6E9FF', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10}} onPress={() => {sendRequest(item?.id)}}>
                            <Text style={{color: "#006AF5"}}>Kết bạn</Text>
                        </TouchableOpacity>
                    
                ): (<View></View>)}
                
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
  
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
  

export default ItemMember;