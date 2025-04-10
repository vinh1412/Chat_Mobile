import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, StatusBar, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from 'react-native';
import { useDispatch, useSelector } from "react-redux";

const ProfileScreen = ({ navigation }) => {
    // const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    // Thêm state mới ở phần đầu component
    const [personalInfoModalVisible, setPersonalInfoModalVisible] = useState(false);
    const [editInfoModalVisible, setEditInfoModalVisible] = useState(false);

    const userProfile = useSelector(state => state.user.user.response);
    console.log(userProfile);

    const [fullName, setFullName] = useState(userProfile?.display_name);
    const [gender, setGender] = useState(userProfile?.gender);

    const [dobDate, setDobDate] = useState(userProfile?.dob ? new Date(userProfile.dob) : new Date()); // Ngày sinh mặc định là ngày hiện tại
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Format lại ngày sinh:
    const formatDate = (date) => {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const handleSave = () => {
        const formattedDob = formatDate(dobDate);
        // Gửi fullName, formattedDob, gender lên server hoặc Redux
        console.log("Saving:", { fullName, formattedDob, gender });
        setEditInfoModalVisible(false);
    };

    return (
        <ScrollView style={styles.container}>

            <View style={styles.iconContainer}>
                {/* Nút mũi tên quay lại */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate("ProfileMain"); // Chuyển đến màn hình chính nếu không có màn hình trước đó
                        }
                    }}
                >
                    <Ionicons name="arrow-back-outline" size={24} color="white" />
                </TouchableOpacity>
                {/* Nút time-outline */}
                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => setHistoryModalVisible(true)}
                >
                    <Ionicons name="time-outline" size={24} color="white" />
                </TouchableOpacity>

                {/* Nút 3 chấm */}
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="ellipsis-horizontal-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Modal hiện lịch sử */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={historyModalVisible}
                onRequestClose={() => setHistoryModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cho phép bạn bè xem nhật ký</Text>

                        <TouchableOpacity style={styles.modalItem}>
                            <Text>Toàn bộ bài đăng</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalItem}>
                            <Text>Trong 7 ngày gần nhất</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalItem}>
                            <Text>Trong 1 tháng gần nhất</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalItem}>
                            <Text>Trong 6 tháng gần nhất</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalItem}>
                            <Text>Tùy chỉnh</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setHistoryModalVisible(false)}
                        >
                            <Text>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal hiện menu */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                                setModalVisible(false);
                                setPersonalInfoModalVisible(true); // mở modal thông tin cá nhân
                            }}
                        >
                            <Text>Thông tin cá nhân</Text>
                        </TouchableOpacity>


                        <TouchableOpacity style={styles.modalItem}>
                            <Text>Đổi ảnh đại diện</Text>
                        </TouchableOpacity>

                        {/* <TouchableOpacity style={styles.modalItem}>
                            <Text>Đổi ảnh bìa</Text>
                        </TouchableOpacity> */}

                        <TouchableOpacity style={styles.modalItem}>
                            <Text>Cập nhật giới thiệu bản thân</Text>
                        </TouchableOpacity>

                        {/* <TouchableOpacity style={styles.modalItem}>
                            <Text>Ví của tôi</Text>
                        </TouchableOpacity> */}

                        {/* Đóng modal */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal thông tin cá nhân */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={personalInfoModalVisible}
                onRequestClose={() => setPersonalInfoModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { width: '90%', padding: 0, }]}>
                        {/* Ảnh bìa và avatar */}
                        <View style={{ position: 'relative', alignItems: 'center' }}>
                            {/* Ảnh bìa */}
                            <Image
                                source={{ uri: 'https://statictuoitre.mediacdn.vn/thumb_w/730/2017/1-1512755474911.jpg' }}
                                style={{ width: '100%', height: 120, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                                resizeMode="cover"
                            />
                            {/* Ảnh đại diện */}
                            <Image
                                source={{ uri: userProfile?.avatar ||'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482741PIj/anh-mo-ta.png' }}
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    borderWidth: 3,
                                    borderColor: 'white',
                                    position: 'absolute',
                                    bottom: -50
                                }}
                            />
                        </View>

                        {/* Thông tin bên dưới avatar */}
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>
                                {userProfile?.display_name}
                            </Text>
                        </View>

                        {/* Thông tin chi tiết */}
                        <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Giới tính</Text>
                                <Text style={styles.infoValue}>{userProfile?.gender}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Ngày sinh</Text>
                                <Text style={styles.infoValue}>{userProfile?.dob}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Điện thoại</Text>
                                <Text style={styles.infoValue}>{userProfile?.phone}</Text>
                            </View>

                            <Text style={{ color: "#666", fontSize: 12, marginTop: 5 }}>
                                Số điện thoại chỉ hiển thị với người có lưu số bạn trong danh bạ máy
                            </Text>

                            <TouchableOpacity
                                style={[styles.button, { marginTop: 20, alignSelf: "center" }]}
                                onPress={() => {
                                    setPersonalInfoModalVisible(false);
                                    setEditInfoModalVisible(true);
                                }}
                            >
                                <Text style={styles.buttonText}>Chỉnh sửa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>



            {/* Modal chỉnh sửa thông tin cá nhân */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={editInfoModalVisible}
                onRequestClose={() => setEditInfoModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: "#fff" }}>
                    {/* Header */}
                    <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
                        <TouchableOpacity onPress={() => setEditInfoModalVisible(false)}>
                            <Ionicons name="arrow-back-outline" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={{ color: "black", fontSize: 20, marginLeft: 16 }}>Chỉnh sửa thông tin</Text>
                    </View>

                    {/* Avatar */}
                    <View style={{ alignItems: "center", marginTop: 20 }}>
                        <Image
                            source={{
                                uri: userProfile?.avatar || "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482741PIj/anh-mo-ta.png"
                            }}
                            style={{ width: 100, height: 100, borderRadius: 50 }}
                        />
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#eee",
                                borderRadius: 20,
                                padding: 5,
                                position: "absolute",
                                top: 80,
                                right: 120
                            }}
                            onPress={() => console.log("Đổi ảnh đại diện")}
                        >
                            <Ionicons name="camera-outline" size={18} color="black" />
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
                        {/* Họ tên */}
                        <Text style={{ color: "black", marginBottom: 5 }}>Họ tên</Text>
                        <TextInput
                            style={{
                                backgroundColor: "#f0f0f0",
                                borderRadius: 5,
                                padding: 10,
                                marginBottom: 10,
                                color: "black"
                            }}
                            value={fullName}
                            onChangeText={setFullName}
                        />

                        {/* Ngày sinh */}
                        {/* Ngày sinh */}
                        <Text style={{ color: "black", marginBottom: 5 }}>Ngày sinh</Text>
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#f0f0f0",
                                borderRadius: 5,
                                padding: 10,
                                marginBottom: 10
                            }}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={{ color: "black" }}>{formatDate(dobDate)}</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={dobDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    const currentDate = selectedDate || dobDate;
                                    setShowDatePicker(Platform.OS === 'ios');
                                    setDobDate(currentDate);
                                }}
                            />
                        )}

                        {/* Giới tính */}
                        <Text style={{ color: "black", marginBottom: 5 }}>Giới tính</Text>
                        <View style={{ flexDirection: "row", marginBottom: 20 }}>
                            <TouchableOpacity
                                style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}
                                onPress={() => setGender("Nam")}
                            >
                                <Ionicons
                                    name={gender === "Nam" ? "checkmark-circle" : "ellipse-outline"}
                                    size={20}
                                    color="#007AFF"
                                />
                                <Text style={{ color: "black", marginLeft: 5 }}>Nam</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flexDirection: "row", alignItems: "center" }}
                                onPress={() => setGender("Nữ")}
                            >
                                <Ionicons
                                    name={gender === "Nữ" ? "checkmark-circle" : "ellipse-outline"}
                                    size={20}
                                    color="#007AFF"
                                />
                                <Text style={{ color: "black", marginLeft: 5 }}>Nữ</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Nút lưu */}
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#00A9FF",
                                borderRadius: 30,
                                padding: 15,
                                alignItems: "center"
                            }}
                            onPress={handleSave}
                        >
                            <Text style={{ color: "white", fontWeight: "bold" }}>LƯU</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



            {/* Ảnh bìa */}
            <View style={styles.coverPhotoContainer}>
                <Image
                    source={{ uri: "https://statictuoitre.mediacdn.vn/thumb_w/730/2017/1-1512755474911.jpg" }}
                    style={styles.coverPhoto}
                />
            </View>

            {/* Ảnh đại diện và thông tin */}
            <View style={styles.profileInfo}>
                <Image
                    source={{ uri: userProfile?.avatar || "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482741PIj/anh-mo-ta.png" }}
                    style={styles.avatar}
                />
                <Text style={styles.userName}>{fullName}</Text>
                <TouchableOpacity onPress={() => navigation.navigate("EditStatus")}>
                    <Text style={styles.status}>"Đường còn dài, tuổi còn trẻ"</Text>
                </TouchableOpacity>

            </View>

            {/* Các mục khác */}
            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="images-outline" size={24} color="black" />
                    <Text style={styles.menuText}>Ảnh của tôi</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="bookmark-outline" size={24} color="black" />
                    <Text style={styles.menuText}>Kho khoảnh khắc</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    coverPhotoContainer: { height: 200, backgroundColor: "#ccc" },
    coverPhoto: { width: "100%", height: "100%" },
    profileInfo: { alignItems: "center", marginTop: -50 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#fff" },
    userName: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
    status: {
        fontSize: 18,
        color: "#000000",
        // textDecorationLine: "underline",
    },
    actions: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
    button: { flexDirection: "row", alignItems: "center", backgroundColor: "#007AFF", padding: 10, borderRadius: 5, marginHorizontal: 5 },
    buttonText: { color: "white", marginLeft: 5 },
    menu: { marginTop: 20 },
    menuItem: { flexDirection: "row", alignItems: "center", padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
    menuText: { fontSize: 18, marginLeft: 10 },
    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15, // Tăng padding ngang để có khoảng cách đều hơn
        paddingVertical: 10, // Thêm padding dọc để căn giữa
        top: 40
    },

    backButton: {
        position: "absolute",
        left: 10,  // Căn lề trái
        padding: 5,
        zIndex: 10, // Đảm bảo nút nằm trên cùng
    },
    historyButton: {
        position: "absolute",
        // top: 50,
        right: 50,
        zIndex: 10,
    },
    menuButton: {
        position: "absolute",
        // top: 45,  // Giảm xuống để không bị che khuất
        right: 10, // Đặt sát mép phải
        zIndex: 10, // Đảm bảo nằm trên cùng
        padding: 10,
        borderRadius: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    mmodalContent: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingBottom: 20,
        overflow: "hidden"
    }
    ,
    modalItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    closeButton: {
        marginTop: 10,
        alignItems: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: 300,
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    closeButton: {
        marginTop: 10,
        alignItems: "center",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    infoLabel: {
        fontWeight: "bold",
        fontSize: 16,
    },
    infoValue: {
        fontSize: 16,
    },


});

export default ProfileScreen;
