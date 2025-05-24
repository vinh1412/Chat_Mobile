import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import IconAnt from "react-native-vector-icons/AntDesign";
import IconFe from "react-native-vector-icons/Feather";
import IconIon from "react-native-vector-icons/Ionicons";
import IconFo from "react-native-vector-icons/Fontisto";

import ConversationScreen from "../pages/ConversationScreen";
import SingleChatScreen from "../pages/SingleChatScreen";
import DetailSingleChatScreen from "../pages/DetailSingleChatScreen";
import Phonebook from "../pages/Phonebook";
import DiaryMy from "../pages/blog/DiaryMy";

import ProfileMainScreen from "../pages/ProfileMainSrceen";
// import CallScreen from "../pages/CallScreen";
const { width, height } = Dimensions.get("window");

const Tab = createBottomTabNavigator();
const TabBottom = () => {
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Tin nhắn") {
              iconName = "wechat";
              return <IconAnt name={iconName} size={size} color={color} />;
            } else if (route.name === "Danh bạ") {
              iconName = "contacts";
              return <IconAnt name={iconName} size={size} color={color} />;
            } else if (route.name === "Nhật ký") {
              iconName = "clockcircleo";
              return <IconAnt name={iconName} size={size} color={color} />;
            } else if (route.name === "Cá nhân") {
              iconName = "user";
              return <IconAnt name={iconName} size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: "#006AF5",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            height: 65,
            paddingBottom: 10,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 10,
          },
        })}
      >
        <Tab.Screen
          name="Tin nhắn"
          component={ConversationScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Danh bạ" 
          component={Phonebook} // Nhớ đổi tên lại
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Nhật ký" 
          component={DiaryMy} // Nhớ đổi tên lại
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Cá nhân" // Đổi tên thành Dictionary (hoặc tên khác)
          component={ProfileMainScreen} // Nhớ đổi tên lại
          // component={CallScreen}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </>
  );
};

export default TabBottom;
