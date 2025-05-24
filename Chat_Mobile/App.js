import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./src/pages/LoginScreen";
import RegisterScreen from "./src/pages/RegisterScreen";
import VerifyScreen from "./src/pages/VerifyScreen";
import NameRegisterScreen from "./src/pages/NameRegisterScreen";
import PersonalInfoScreen from "./src/pages/PersonalInfoScreen";
import AvatarScreen from "./src/pages/AvatarScreen";
import HomeScreen from "./src/pages/HomeScreen";
import ConversationScreen from "./src/pages/ConversationScreen";
import TabBottom from "./src/navigation/TabBottom";
import SingleChatScreen from "./src/pages/SingleChatScreen";
import DetailSingleChatScreen from "./src/pages/DetailSingleChatScreen";
import GroupChatScreen from "./src/pages/GroupChatScreen";
import DetailGroupChatScreen from "./src/pages/DetailGroupChatScreen";
import { BottomTabBar } from "@react-navigation/bottom-tabs";

import ProfileScreen from "./src/pages/ProfileScreen";
import EditStatusScreen from "./src/pages/EditStatusScreen"; // Import man hinh EditStatus
import FindInfo from "./src/navigation/FindInfo";

import ProfileMainScreen from "./src/pages/ProfileMainSrceen";
import CallScreen from "./src/pages/CallScreen";

import AddFriendScreen from "./src/pages/AddFriendScreen";
import FitlerMemberScreen from "./src/pages/FitlerMemberScreen";
import AccountSecurityScreen from "./src/pages/AccountSecurityScreen";
import ChangePasswordScreen from "./src/pages/ChangePasswordScreen";
import ResetPasswordScreen from "./src/pages/ResetPasswordScreen";
import TabTopFriendRequest from "./src/navigation/TabTopFriendRequest";

import MessageForwarding from "./src/pages/MessageForwarding";
import QRScannerScreen from "./src/components/QRScannerScreen";

import MemberGroupScreen from "./src/pages/MemberGroupScreen";
import ChooseLeaderScreen from "./src/pages/ChooseLeaderScreen";

import { getToken } from "./src/utils/authHelper";
import { AuthProvider } from "./src/contexts/AuthContext";
import { useAuth } from "./src/contexts/AuthContext";
import { connect, Provider, useSelector } from "react-redux";
import store from "./src/store/store";
import { ToastProvider } from "react-native-toast-notifications";

import { subscribeToSendFriendRequest, connectWebSocket, disconnectWebSocket } from "./src/config/socket";
import { useToast } from 'react-native-toast-notifications';

import JoinGroupQR from "./src/pages/JoinGroupQR";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { showFriendRequestToast } from "./src/utils/toast";
import PostStatusScreen  from "./src/pages/blog/PostStatusScreen";
const Stack = createStackNavigator();

const AppNavigation = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const toast = useToast();

  
  const user = useSelector(state => state.user?.user);
  useEffect(() => {
    // console.log("user----", user);
    if(user?.id) {
      connectWebSocket(() => {
        
        subscribeToSendFriendRequest(user?.id, (response) => {
          console.log("Received friend request:", response);

          showFriendRequestToast({ response, toast });
        });
      });

      return () => {
        disconnectWebSocket();
      };
    }
  }, [user?.id, connectWebSocket]);

  if (isLoading) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <>
            <Stack.Screen
              name="Main"
              component={TabBottom}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Conversation"
              component={ConversationScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="SingleChatScreen"
              component={SingleChatScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DetailSingleChatScreen"
              component={DetailSingleChatScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GroupChatScreen"
              component={GroupChatScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DetailGroupChatScreen"
              component={DetailGroupChatScreen}
              options={{ headerTitle: "Tùy chọn" }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditStatus"
              component={EditStatusScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="FindInfo"
              component={FindInfo}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProfileMainScreen"
              options={{ headerShown: false }}
            >
              {(props) => (
                <ProfileMainScreen {...props} setIsLoggedIn={setIsLoggedIn} />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="CallScreen"
              component={CallScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddFriendScreen"
              component={AddFriendScreen}
              options={{ headerTitle: "Thêm bạn bè" }}
            />
            <Stack.Screen
              name="CreateGroupScreen"
              component={FitlerMemberScreen}
              options={{ headerTitle: "Thành viên" }}
            />
            <Stack.Screen
              name="AccountSecurity"
              component={AccountSecurityScreen}
              options={{ headerTitle: "Tài khoản & Bảo mật" }}
            />
            <Stack.Screen
              name="ChangePasswordScreen"
              component={ChangePasswordScreen}
              options={{ headerTitle: "Thay đổi mật khẩu" }}
            />
            <Stack.Screen
              name="TabTopFriendRequest"
              component={TabTopFriendRequest}
              options={{ headerTitle: "Lời mời kết bạn" }}
            />
            <Stack.Screen
              name="MessageForwarding"
              component={MessageForwarding}
              options={{ headerTitle: "Chia sẻ tin nhắn", headerShown: false }}
            />

            <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />

            <Stack.Screen
              name="MemberGroupScreen"
              component={MemberGroupScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="JoinGroupQR"
              component={JoinGroupQR}
              options={{ headerTitle: "Tham gia nhóm" }}
            />
            <Stack.Screen
              name="PostStatusScreen"
              component={PostStatusScreen}
              options={{headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="HomeScreen"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RegisterScreen"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="VerifyScreen"
              component={VerifyScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NameRegisterScreen"
              component={NameRegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PersonalInfoScreen"
              component={PersonalInfoScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AvatarScreen"
              component={AvatarScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ResetPasswordScreen"
              component={ResetPasswordScreen}
              options={{ headerTitle: "Tạo mật khẩu mới", headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <ToastProvider
        placement="top"
        duration={3000}
        offset={30}
        animationType="slide-in"
        successColor="#4CAF50"
        errorColor="#F44336"
      >
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigation />
        </AuthProvider>
      </ToastProvider>
    </Provider>
  );
}
