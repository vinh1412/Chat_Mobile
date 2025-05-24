import React, { useState, useMemo } from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import FindInfo from '../navigation/FindInfo';
import { removeToken } from '../utils/authHelper';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../store/slice/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../api/authApi';
import { Alert } from 'react-native';
import { updateUserProfileSuccess } from '../store/slice/userSlice';

import { connectWebSocket, disconnectWebSocket, subscribeToUserProfile } from "../config/socket";


const ProfileMainScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const { setIsLoggedIn } = useAuth(); // Get setIsLoggedIn from AuthContext
    const dispatch = useDispatch();
    const userProfile = useSelector(state => state.user.user);

    const user = useMemo(() => {
            return userProfile || null;
    }, [userProfile]);

    console.log(userProfile);

    // xu ly khi nhan duoc tin nhan tu websocket tu dong cap nhat lai trang thai
    React.useEffect(() => {
            if(!user?.id) return;
            console.log("user", user.id);
            
            // function để xử lý khi nhận được tin nhắn từ WebSocket
            const handleMessageReceived = (updatedProfile) => {
                console.log("Message received:", updatedProfile);
                // Xử lý thông điệp nhận được từ WebSocket
                dispatch(updateUserProfileSuccess(updatedProfile));
            };
    
              connectWebSocket(() => {
                subscribeToUserProfile(user?.id, handleMessageReceived);
            });
    
                
            return () => {
                disconnectWebSocket(); // Ngắt kết nối khi component unmount
            }
    },[user?.id, dispatch]);

    React.useEffect(() => {
        dispatch(getProfile());
    },[])
    //logout
    const handleLogout = async () => {
        console.log('Logout pressed');
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất không?",
            [
                {
                    text: "Hủy",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
                {
                    text: "Đăng xuất",
                    onPress: async () => {
                        console.log("Logout confirmed");
                        try {
                            await logout();
                            removeToken();

                            setIsLoggedIn(false);
                            setTimeout(() => {
                                navigation.replace("HomeScreen");
                            }, 1);
                        } catch (error) {
                            console.error('Error during logout:', error);
                        }
                    },
                    style: "default",
                }
            ]
        )

    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView>
                <Header iconRight="logout" onIconRightPress={handleLogout} />
                {modalVisible && <FindInfo />}
            </SafeAreaView>

            {/* Profile */}
            <View style={styles.profileContainer}>
                <Image
                    source={{ uri: user?.avatar || 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482741PIj/anh-mo-ta.png' }}
                    style={styles.avatar}
                />
                <TouchableOpacity onPress={() => { setModalVisible(false); navigation.navigate("Profile"); }}>
                    <Text style={styles.name}>{user?.display_name}</Text>
                    <Text style={styles.viewProfile}>Xem trang cá nhân</Text>
                </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <ScrollView>
                {/* <MenuItem icon="cloud" title="Cloud" subtitle="Không gian lưu trữ dữ liệu trên đám mây" /> */}
                {/* <MenuItem icon="paint-brush" title="Style - Nổi bật trên Chat" subtitle="Hình nền và nhạc cho cuộc gọi Chat" /> */}
                {/* <MenuItem icon="cloud-upload" title="Cloud của tôi" subtitle="Lưu trữ các tin nhắn quan trọng" /> */}
                {/* <MenuItem icon="folder" title="Dữ liệu trên máy" subtitle="Quản lý dữ liệu Chat của bạn" /> */}
                {/* <MenuItem icon="qrcode" title="Ví QR" subtitle="Lưu trữ và xuất trình các mã QR quan trọng" /> */}
                <MenuItem icon="shield" title="Tài khoản và bảo mật" onPress={() => navigation.navigate("AccountSecurity")} />

                <MenuItem icon="lock" title="Quyền riêng tư"/>
            </ScrollView>
        </View>
    );
};

const MenuItem = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <Icon name={icon} size={22} color="#007AFF" style={styles.icon} />
        <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>{title}</Text>
            {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        marginTop: StatusBar.currentHeight || 0,
    },

    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },

    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        marginRight: 15,
    },

    name: {
        color: '#121212',
        fontSize: 18,
        fontWeight: 'bold',
    },

    viewProfile: {
        color: '#007AFF',
        fontSize: 14,
        marginTop: 3,
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },

    icon: {
        marginRight: 15,
    },

    menuTextContainer: {
        flex: 1,
    },

    menuTitle: {
        color: '#121212',
        fontSize: 16,
        fontWeight: '500',
    },

    menuSubtitle: {
        color: '#666666',
        fontSize: 12,
        marginTop: 3,
    },
});

export default ProfileMainScreen;
