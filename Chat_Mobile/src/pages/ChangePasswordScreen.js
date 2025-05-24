import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Header';
import { changePassword } from '../api/userApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext'; // đúng đường dẫn context của bạn


const ChangePasswordScreen = ({ navigation }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { setIsLoggedIn } = useAuth();


    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            const data = {
                oldPassword,
                newPassword
            };
            await changePassword(data);

            Alert.alert("Thành công", "Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.", {

            });

            Alert.alert(
                        "Thành công",
                        "Mật khẩu đã được thay đổi. Bạn có chắc chắn muốn đăng xuất không?",
                        [
                            {
                                text: "Tiếp tục",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel",
                            },
                            {
                                text: "Đăng nhập lại",
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
                
        } catch (error) {
            Alert.alert("Lỗi", "Không thể đổi mật khẩu");
            console.error(error);

            Alert.alert("Lỗi",  error?.response?.data?.message || error?.message, [{ text: "OK" }]);
            
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu hiện tại"
                    secureTextEntry
                    value={oldPassword}
                    onChangeText={setOldPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu mới"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Xác nhận mật khẩu mới"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                    <Text style={styles.buttonText}>Xác nhận</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        padding: 20,
        marginTop: 30,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#FFF',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ChangePasswordScreen;
