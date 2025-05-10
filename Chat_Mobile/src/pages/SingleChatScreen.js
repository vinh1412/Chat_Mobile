import React, { useState, useRef, useMemo, useEffect } from "react";
import { GIPHY_API_KEY } from "@env";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Animated,
    TouchableNativeFeedback,
    Linking,
    Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import IconF from "react-native-vector-icons/Feather";
import IconM from "react-native-vector-icons/MaterialCommunityIcons";
import IconE from "react-native-vector-icons/Entypo";
import IconF5 from "react-native-vector-icons/FontAwesome5";
import IconA from "react-native-vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import { useSelector, useDispatch } from "react-redux";
import {
    getAllMessagesByConversationId,
    sendMessageToUser,
    setMessagesUpdate,
    addMessage,
    deleteMessage,
    loadDeletedMessageIdsAsync,
    deleteMessageForUserThunk,
} from "../store/slice/messageSlice";
import { convertHours } from "../utils/convertHours";
import ActionSheet from "react-native-actions-sheet";
import dayjs from "dayjs";

import {
    connectWebSocket,
    disconnectWebSocket,
    subscribeToChat,
    sendMessageToWebSocket,
    recallMessageToWebSocket,
    deleteMessageToWebSocket,
    sendFileToWebSocket,
} from "../config/socket";

import { sendReq, checkFriendStatus } from "../store/slice/friendSlice";

import { uploadFile } from "../api/chatApi";
import Loading from "../components/Loading";

const { width, height } = Dimensions.get("window");
const audioRecorderPlayer = new AudioRecorderPlayer();
import { getFileIcon } from "../utils/FormatIconFile"; // Import hàm getFileIcon từ file FormatIconFile.js
import EmojiSelector from "react-native-emoji-selector";

const SingleChatScreen = ({ navigation, route }) => {
    // tự động cuộn xuống cuối danh sách khi có tin nhắn mới
    const bottomRef = useRef(null);

    const actionSheetRef = useRef(null);

    const { conversationId, userReceived } = route.params; // Nhận userId từ params
    console.log("conversationId", conversationId);

    // state để điều khiển hiển thị thanh công cụ
    const [emojiToolbarVisible, setEmojiToolbarVisible] = useState(false);
    const [fileToolbarVisible, setFileToolbarVisible] = useState(false);
    const emojiAnimation = useRef(new Animated.Value(0)).current;
    const fileAnimation = useRef(new Animated.Value(0)).current;

    const dispatch = useDispatch();
    const { messages } = useSelector((state) => state.message);
    const { user } = useSelector((state) => state.user);
    // State quản lý emoji/gif/sticker
    const [contentType, setContentType] = useState("emoji");
    const [gifs, setGifs] = useState([]);
    const [loadingGifs, setLoadingGifs] = useState(false);
    const [stickers, setStickers] = useState([]);
    const [loadingStickers, setLoadingStickers] = useState(false);

    // Fetch GIFs from Giphy REST API
    useEffect(() => {
        const fetchGifs = async () => {
            setLoadingGifs(true);
            try {
                const response = await fetch(
                    `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=50`
                );
                const data = await response.json();
                setGifs(data.data || []);
            } catch (error) {
                console.error("Error fetching GIFs:", error);
                setGifs([]);
            } finally {
                setLoadingGifs(false);
            }
        };

        // Updated condition to check emojiToolbarVisible
        if (contentType === "gif" && emojiToolbarVisible) {
            fetchGifs();
        }
    }, [contentType, emojiToolbarVisible]);

    // Fetch GIFs from Giphy REST API
    useEffect(() => {
        const fetchStickers = async () => {
            setLoadingStickers(true);
            try {
                const response = await fetch(
                    `https://api.giphy.com/v1/stickers/trending?api_key=${GIPHY_API_KEY}&limit=50`
                );
                const data = await response.json();
                setStickers(data.data || []);
            } catch (error) {
                console.error("Error fetching Stickers:", error);
                setStickers([]);
            } finally {
                setLoadingStickers(false);
            }
        };

        // Updated condition to check emojiToolbarVisible
        if (contentType === "sticker" && emojiToolbarVisible) {
            fetchStickers();
        }
    }, [contentType, emojiToolbarVisible]);

    // Handle emoji selection
    const onEmojiClick = (emojiObject) => {
        const messageData = {
            senderId: user?.id,
            conversationId: conversationId,
            messageType: "EMOJI",
            content: emojiObject,
            fileUrl: null,
        };
        sendMessageToWebSocket(messageData);

        setMessages([...messagesLocal, messageData]);
        hideToolbars();
    };

    // Handle GIF selection
    const handleGifClick = (gif) => {
        const messageData = {
            senderId: user?.id,
            conversationId: conversationId,
            messageType: "GIF",
            content: "",
            fileUrl: gif.images.original.url,
            replyToMessageId: null,
        };
        sendMessageToWebSocket(messageData);
        setMessages([...messagesLocal, messageData]);
        hideToolbars();
    };

    // Handle sticker selection
    const handleStickerClick = (sticker) => {
        const messageData = {
            senderId: user?.id,
            conversationId: conversationId,
            messageType: "STICKER",
            fileUrl: sticker.images.original.url,
            replyToMessageId: null,
        };
        sendMessageToWebSocket(messageData);
        setMessages([...messagesLocal, messageData]);
        hideToolbars();
    };

    // Render sticker item
    const renderStickerItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleStickerClick(item)}
            style={mediaItemStyles.container}
        >
            <Image
                source={{ uri: item.images.fixed_height.url }}
                style={mediaItemStyles.image}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    // check friend
    const [isFriend, setIsFriend] = useState(false); // Track friend status

    const messageMemo = useMemo(() => {
        if (!messages) return [];
        return messages;
    }, [messages]);
    console.log("messages", messageMemo.length);

    const [loading, setLoading] = useState(false);
    console.log("loading", loading);

    // Nhận navigation từ props
    const [messagesLocal, setMessages] = useState([]);
    // console.log("messagesLocal", messagesLocal);
    const [inputText, setInputText] = useState("");
    const [imageUri, setImageUri] = useState(null);
    const [recording, setRecording] = useState(false);
    const audioPath = useRef(null);

    const [selectedMessage, setSelectedMessage] = useState(null);

    // Gọi hàm lấy tin nhắn từ slice khi component được mount
    useEffect(() => {
        setMessages(messageMemo); // Cập nhật lại messagesLocal khi messages thay đổi
    }, [messageMemo]);

    useEffect(() => {
        dispatch(getAllMessagesByConversationId(conversationId)); // Gọi hàm lấy tin nhắn từ slice
    }, [conversationId, dispatch]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollToEnd({ animated: true });
        }
    }, [messagesLocal]);

    // Kết nối WebSocket
    useEffect(() => {
        connectWebSocket(() => {
            subscribeToChat(conversationId, (newMessage) => {
                console.log("Received message:", newMessage);
                dispatch(addMessage(newMessage));
            });
        });

        return () => {
            disconnectWebSocket(); // Ngắt kết nối khi component unmount
        };
    }, [conversationId]);

    // Lọc tin nhắn đã xóa của user hiện tại
    useEffect(() => {
        if (messageMemo) {
            // Lọc các tin nhắn để không hiển thị những tin nhắn đã bị xóa của user hiện tại
            const filteredMessages = messageMemo.filter(
                (msg) =>
                    // Nếu deletedByUserIds tồn tại và chứa ID của user hiện tại thì không hiển thị tin nhắn này
                    !(
                        msg.deletedByUserIds &&
                        msg.deletedByUserIds.includes(user?.id)
                    )
            );
            // console.log("filteredMessages: ", filteredMessages);
            setMessages(filteredMessages); // Cập nhật localMessages từ messagesMemo
        }
    }, [messageMemo, user?.id]);

    // Toolbar animation
    const toggleEmojiToolbar = () => {
        Animated.timing(emojiAnimation, {
            toValue: emojiToolbarVisible ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setEmojiToolbarVisible(!emojiToolbarVisible);
        // Close file toolbar if open
        setFileToolbarVisible(false);
        Animated.timing(fileAnimation, {
            toValue: 0,
            duration: 0, // Immediate reset
            useNativeDriver: false,
        }).start();
    };

    const toggleFileToolbar = () => {
        Animated.timing(fileAnimation, {
            toValue: fileToolbarVisible ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setFileToolbarVisible(!fileToolbarVisible);
        // Close emoji toolbar if open
        setEmojiToolbarVisible(false);
        Animated.timing(emojiAnimation, {
            toValue: 0,
            duration: 0, // Immediate reset
            useNativeDriver: false,
        }).start();
    };

    const hideToolbars = () => {
        if (emojiToolbarVisible) {
            Animated.timing(emojiAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
            setEmojiToolbarVisible(false);
        }
        if (fileToolbarVisible) {
            Animated.timing(fileAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
            setFileToolbarVisible(false);
        }
    };

    const emojiToolbarHeight = emojiAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 300], // Larger height for emoji/GIF selector
    });

    const fileToolbarHeight = fileAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 250], // Smaller height for image/file buttons
    });

    const sendMessage = () => {
        if (inputText.trim()) {
            const messageData = {
                senderId: user?.id,
                conversationId: conversationId,
                messageType: "TEXT",
                content: inputText,
                fileUrl: null,
                replyToMessageId: null,
            };
            console.log("messageData: ", messageData);

            sendMessageToWebSocket(messageData);

            // dispatch(sendMessageToUser(messageData)); // Gọi hàm gửi tin nhắn từ slice
            setMessages([...messages, messageData]);
            setInputText("");
            setImageUri(null);
        }
    };

    // Chọn ảnh từ thư viện
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const img = result.assets[0];
            const imageUri = {
                uri: img.uri,
                name: img.fileName || "image.jpg",
                type: "image/jpeg",
            };
            setImageUri(imageUri);

            handleSendImage(imageUri);
        }
    };

    //send image;
    const handleSendImage = async (imageUri) => {
        setLoading(true); // Bật loading
        try {
            const request = {
                senderId: user?.id,
                conversationId: conversationId,
                content: "",
                messageType: "IMAGE",
            };

            const formData = new FormData();
            formData.append(
                "request",
                JSON.stringify(request),
                "application/json"
            );

            if (imageUri) {
                formData.append("anh", imageUri);
                console.log("image :", imageUri);
            }

            const response = await uploadFile(formData);
            console.log("response uploadFile: ", response);

            request.fileUrl = response?.response?.fileUrl;
            sendMessageToWebSocket(request);
        } catch (error) {
            console.error("Lỗi khi gửi ảnh: ", error);
            // Có thể thêm thông báo lỗi cho người dùng
        } finally {
            setLoading(false); // Tắt loading
        }
    };

    // chon tài liệu từ thư viện
    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            const documentUri = {
                uri: asset.uri,
                name: asset.name || "document.pdf",
                type: asset.mimeType || "application/octet-stream",
            };
            console.log("documentUri: ", documentUri);
            setImageUri(documentUri);

            handleSendFile(documentUri);
        }
    };

    const handleSendFile = async (imageUri) => {
        setLoading(true); // Bật loading
        console.log("imageUri: ", imageUri?.name);
        try {
            const request = {
                senderId: user?.id,
                conversationId: conversationId,
                content: imageUri?.name || "Tài liệu",
                messageType: "FILE",
            };

            const formData = new FormData();
            formData.append(
                "request",
                JSON.stringify(request),
                "application/json"
            );

            if (imageUri) {
                formData.append("anh", imageUri);
                console.log("file :", imageUri);
            }

            const response = await uploadFile(formData);
            // console.log("response uploadFile: ", response);

            request.fileUrl = response?.response?.fileUrl;
            sendMessageToWebSocket(request);
        } catch (error) {
            console.error("Lỗi khi gửi file: ", error);
            // Có thể thêm thông báo lỗi cho người dùng
        } finally {
            setLoading(false); // Tắt loading
        }
    };

    // click vào tin nhắn để mở tài liệu
    const openFile = async (url) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Lỗi", "Không thể mở file");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể mở file: " + error.message);
        }
    };

    // Hàm gửi video
    const handleSendVideo = async (videoUri) => {
        setLoading(true); // Bật loading
        try {
            const request = {
                senderId: user?.id,
                conversationId: conversationId,
                content: "",
                messageType: "VIDEO",
            };
            const formData = new FormData();
            formData.append(
                "request",
                JSON.stringify(request),
                "application/json"
            );
            if (videoUri) {
                formData.append("anh", videoUri);
                console.log("videoUri :", videoUri);
            }
            const response = await uploadFile(formData);
            console.log("response uploadFile: ", response);
            request.fileUrl = response?.response?.fileUrl;
            sendMessageToWebSocket(request);
        } catch (error) {
            console.error("Lỗi khi gửi video: ", error);
            // Có thể thêm thông báo lỗi cho người dùng
        } finally {
            setLoading(false); // Tắt loading
        }
    };

    // pick video
    const pickVideo = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [4, 3], // Tỉ lệ khung hình 1:1
            quality: 1,
        });
        console.log("result", result);
        if (!result.canceled) {
            const video = result.assets[0];
            const videoUri = {
                uri: video.uri,
                name: video.fileName || `video_${Date.now()}.mp4`,
                type: "video/mp4",
            };
            setImageUri(videoUri);
            handleSendVideo(videoUri);
        }
    };

    // Play video
    const playVideo = async (url) => {
        if (!url) {
            Alert.alert("Lỗi", "Không thể phát video này");
            return;
        }
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                // For more control, you could use a video player component instead
                Alert.alert("Lỗi", "Không thể phát video");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể phát video: " + error.message);
        }
    };

    const startRecording = async () => {
        try {
            setRecording(true);
            const path =
                Platform.OS === "android" ? `${Date.now()}.mp3` : "sound.m4a";
            audioPath.current = path;
            await audioRecorderPlayer.startRecorder(path);
        } catch (error) {
            console.error("Lỗi khi ghi âm: ", error);
        }
    };

    const stopRecording = async () => {
        try {
            const result = await audioRecorderPlayer.stopRecorder();
            setRecording(false);

            setMessages([
                ...messages,
                {
                    id: Date.now().toString(),
                    text: "",
                    image: null,
                    audio: result,
                },
            ]);
        } catch (error) {
            console.error("Lỗi khi dừng ghi âm: ", error);
        }
    };

    const playAudio = async (audioUri) => {
        try {
            await audioRecorderPlayer.startPlayer(audioUri);
        } catch (error) {
            console.error("Lỗi khi phát audio: ", error);
        }
    };

    //Mở ActionSheet khi nhấn giữ tin nhắn
    const handleSelectMessage = (item) => {
        actionSheetRef.current?.show();
        setSelectedMessage(item);
        console.log("Selected message: ", item);
    };

    // xu ly set thời gian có thể xóa tin nhắn
    const canRecallMessage = (timestamp) => {
        const messageTime = dayjs(timestamp);
        const currentTime = dayjs();
        const diffInMinutes = currentTime.diff(messageTime, "minute");
        return diffInMinutes <= 5; // cho pheps thu hoi trong 5 phut
    };

    // xu ly thu hoi tin nhan
    const handleRecallMessage = () => {
        if (selectedMessage && canRecallMessage(selectedMessage.timestamp)) {
            const request = {
                messageId: selectedMessage.id,
                senderId: user?.id,
                conversationId: conversationId,
                fileUrl: null,
                messageType: "TEXT",
            };
            recallMessageToWebSocket(request);
            actionSheetRef.current?.hide();
        } else {
            alert("Không thể thu hồi tin nhắn này sau 2 phút.");
            actionSheetRef.current?.hide();
        }
    };

    // xu ly xoa tin nhan ở phía mình
    const handleDeleteMessage = () => {
        if (selectedMessage) {
            // dispatch(
            //   deleteMessageForUserThunk({
            //     messageId: selectedMessage?.id,
            //     userId: user?.id,
            //   })
            // );

            deleteMessageToWebSocket({
                messageId: selectedMessage?.id,
                userId: user?.id,
            });

            actionSheetRef.current?.hide();
        }
    };

    // Kiểm tra trạng thái bạn bè
    useEffect(() => {
        const checkIsFriend = async () => {
            try {
                const response = await dispatch(
                    checkFriendStatus(userReceived?.id)
                ).unwrap();
                setIsFriend(response); // Cập nhật trạng thái bạn bè
                console.log("Trạng thái bạn bè:", response);
            } catch (error) {
                console.log(`Lỗi khi kiểm tra trạng thái bạn bè cho:`, error);
                setIsFriend(false); // Nếu có lỗi, coi như không phải bạn bè
            }
        };

        if (userReceived?.id) {
            checkIsFriend();
        }
    }, [userReceived?.id, dispatch]);

    // Gửi lời mời kết bạn
    const handleSendRequest = async (friendId) => {
        try {
            const response = await dispatch(sendReq(friendId)).unwrap();
            console.log("response", response);
            if (response.status === "SUCCESS") {
                console.log("Lời mời kết bạn đã được gửi thành công.");

                Alert.alert(
                    "Thông báo",
                    "Lời mời kết bạn đã được gửi thành công.",
                    [{ text: "OK" }],
                    { cancelable: false }
                );
            } else {
                console.log("Không thể gửi lời mời kết bạn.");
            }
        } catch (error) {
            console.log("Lỗi khi gửi lời mời kết bạn:", error);
            Alert.alert(
                "Thông báo",
                error || "Không thể gửi lời mời kết bạn.",
                [{ text: "OK" }],
                { cancelable: false }
            );
        }
    };

    // Render GIF item
    const renderGifItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleGifClick(item)}
            style={mediaItemStyles.container}
        >
            <Image
                source={{ uri: item.images.fixed_height.url }}
                style={mediaItemStyles.image}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1 }}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: "#EBF4FF",
                    marginTop: StatusBar.currentHeight,
                }}
            >
                {/* Header */}
                <View
                    style={{
                        width: width,
                        height: height * 0.07,
                        backgroundColor: "#2196F3",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: width * 0.04,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: width * 0.04,
                        }}
                    >
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon
                                name="arrow-back"
                                size={width * 0.07}
                                color="white"
                            />
                        </TouchableOpacity>
                        <View>
                            <Text
                                style={{
                                    color: "white",
                                    fontSize: width * 0.05,
                                    fontWeight: "bold",
                                }}
                            >
                                {userReceived?.display_name}
                            </Text>
                            <Text
                                style={{
                                    color: "white",
                                    fontSize: width * 0.03,
                                }}
                            >
                                {!isFriend ? "Người lạ" : "Bạn bè"}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: width * 0.04,
                        }}
                    >
                        <View
                            style={{ flexDirection: "row", gap: width * 0.04 }}
                        >
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate("CallScreen")
                                }
                            >
                                <Icon
                                    name="call"
                                    size={width * 0.07}
                                    color="white"
                                />
                            </TouchableOpacity>
                            <Icon
                                name="videocam"
                                size={width * 0.07}
                                color="white"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate("DetailSingleChatScreen", {
                                    userReceived,
                                })
                            }
                        >
                            <Icon
                                name="menu"
                                size={width * 0.07}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Check friend */}
                {conversationId && !isFriend ? (
                    <TouchableOpacity
                        style={{
                            fontSize: 12,
                            backgroundColor: "#fff",
                            paddingHorizontal: 15,
                            paddingVertical: 10,
                        }}
                        onPress={() => {
                            handleSendRequest(userReceived?.id);
                        }}
                    >
                        <Text
                            style={{
                                color: "#000",
                                textAlign: "center",
                                fontSize: 18,
                            }}
                        >
                            {" "}
                            <IconA size={24} name="adduser"></IconA> Kết bạn
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View></View>
                )}

                {/* Hiển thị tin nhắn */}
                <TouchableNativeFeedback onPress={hideToolbars}>
                    <View style={{ flex: 1 }}>
                        <FlatList
                            ref={bottomRef}
                            data={messagesLocal}
                            renderItem={({ item }) => (
                                <View>
                                    {item?.senderId !== user?.id ? (
                                        <Image
                                            source={{
                                                uri: userReceived?.avatar,
                                            }}
                                            style={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: 15,
                                                marginTop: 5,
                                            }}
                                        />
                                    ) : null}

                                    <TouchableOpacity
                                        onLongPress={() =>
                                            handleSelectMessage(item)
                                        }
                                        style={{
                                            padding: 10,
                                            alignSelf:
                                                item?.senderId === user?.id
                                                    ? "flex-end"
                                                    : "flex-start",
                                            borderWidth:
                                                // item?.messageType === "GIF" ||
                                                item?.messageType === "STICKER"
                                                    ? 0
                                                    : 1,
                                            borderColor: "#52A0FF",
                                            borderRadius: 10,
                                            margin: 5,
                                            marginLeft:
                                                item?.senderId !== user?.id
                                                    ? 25
                                                    : 0,
                                            backgroundColor:
                                                // item?.messageType === "GIF" ||
                                                item?.messageType === "STICKER"
                                                    ? "transparent"
                                                    : item?.senderId ===
                                                      user?.id
                                                    ? "#8FC1FF"
                                                    : "white",
                                        }}
                                    >
                                        {item?.messageType === "TEXT" ||
                                        item?.messageType === "EMOJI" ? (
                                            <View>
                                                <Text
                                                    style={{
                                                        color: "black",
                                                        fontSize:
                                                            item?.messageType ===
                                                            "EMOJI"
                                                                ? width * 0.08 // Larger font for emojis
                                                                : width * 0.04, // Normal font for text
                                                    }}
                                                >
                                                    {item?.content}
                                                </Text>
                                            </View>
                                        ) : null}
                                        {item?.messageType === "IMAGE" ||
                                        item?.messageType === "GIF" ||
                                        item?.messageType === "STICKER" ? (
                                            <Image
                                                source={{ uri: item?.fileUrl }}
                                                style={{
                                                    width:
                                                        item?.messageType ===
                                                        "STICKER"
                                                            ? 100 // Smaller size for stickers and GIFs
                                                            : 150, // Original size for images
                                                    height:
                                                        item?.messageType ===
                                                        "STICKER"
                                                            ? 100 // Smaller size for stickers and GIFs
                                                            : 150, // Original size for images
                                                    borderRadius:
                                                        item?.messageType ===
                                                        "IMAGE"
                                                            ? 10
                                                            : 0,
                                                    marginTop: 5,
                                                    backgroundColor:
                                                        "transparent",
                                                }}
                                                resizeMode="contain"
                                            />
                                        ) : null}
                                        {item?.messageType === "FILE" ? (
                                            <Text
                                                style={{
                                                    color: "black",
                                                    fontSize: width * 0.04,
                                                }}
                                            >
                                                {item?.fileUrl ? (
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            openFile(
                                                                item?.fileUrl
                                                            )
                                                        }
                                                        style={{
                                                            flexDirection:
                                                                "row",
                                                            alignItems:
                                                                "center",
                                                        }}
                                                    >
                                                        <IconF5
                                                            name={getFileIcon(
                                                                item?.content
                                                            )}
                                                            size={30}
                                                            color="black"
                                                            style={{
                                                                marginRight: 5,
                                                                paddingVertical: 5,
                                                                paddingHorizontal: 10,
                                                            }}
                                                        />
                                                        <View>
                                                            <Text
                                                                style={{
                                                                    color: "",
                                                                    fontSize:
                                                                        width *
                                                                        0.04,
                                                                    paddingRight: 10,
                                                                }}
                                                            >
                                                                {item?.content}
                                                            </Text>
                                                            <Text
                                                                style={{
                                                                    fontSize:
                                                                        width *
                                                                        0.03,
                                                                    color: "blue",
                                                                    paddingRight: 10,
                                                                    paddingTop: 2,
                                                                }}
                                                            >
                                                                Tải về để xem
                                                                lâu dài{" "}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                ) : null}
                                            </Text>
                                        ) : null}
                                        {item?.messageType === "VIDEO" ? (
                                            <View>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        playVideo(item?.fileUrl)
                                                    }
                                                >
                                                    <View
                                                        style={{
                                                            position:
                                                                "relative",
                                                        }}
                                                    >
                                                        <Image
                                                            source={{
                                                                uri:
                                                                    item?.fileUrl ||
                                                                    "https://via.placeholder.com/150",
                                                            }}
                                                            style={{
                                                                width: 150,
                                                                height: 150,
                                                                borderRadius: 10,
                                                                marginTop: 5,
                                                            }}
                                                            resizeMode="cover"
                                                        />
                                                        <View
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                top: "50%",
                                                                left: "50%",
                                                                transform: [
                                                                    {
                                                                        translateX:
                                                                            -15,
                                                                    },
                                                                    {
                                                                        translateY:
                                                                            -15,
                                                                    },
                                                                ],
                                                                backgroundColor:
                                                                    "rgba(0,0,0,0.5)",
                                                                borderRadius: 20,
                                                                padding: 5,
                                                            }}
                                                        >
                                                            <IconF5
                                                                name="play"
                                                                size={20}
                                                                color="white"
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        ) : null}
                                        {item?.messageType === "AUDIO" ? (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    playAudio(item.audio)
                                                }
                                            >
                                                <Icon
                                                    name="play-circle"
                                                    size={40}
                                                    color="white"
                                                />
                                            </TouchableOpacity>
                                        ) : null}
                                        <Text
                                            style={{
                                                fontSize: width * 0.03,
                                                color: "gray",
                                            }}
                                        >
                                            {convertHours(item?.timestamp)}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            keyExtractor={(item) => item?.id}
                            initialNumToRender={20} // Số lượng tin nhắn ban đầu được render
                            maxToRenderPerBatch={10} // Số lượng tin nhắn được render mỗi lần
                            contentContainerStyle={{ padding: 10 }}
                            onContentSizeChange={() =>
                                bottomRef.current?.scrollToEnd({
                                    animated: true,
                                })
                            }
                        />
                    </View>
                </TouchableNativeFeedback>

                {/* Nhập tin nhắn */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "white",
                            paddingHorizontal: width * 0.04,
                            paddingVertical: 10,
                        }}
                    >
                        <TouchableOpacity onPress={toggleEmojiToolbar}>
                            <IconE
                                name="emoji-happy"
                                size={width * 0.07}
                                color="gold"
                                style={{ margin: width * 0.01 }}
                            />
                        </TouchableOpacity>
                        <TextInput
                            placeholder="Tin nhắn..."
                            value={inputText}
                            onChangeText={setInputText}
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: width * 0.05,
                                paddingHorizontal: width * 0.04,
                                fontSize: width * 0.04,
                            }}
                        />
                        <TouchableOpacity onPress={toggleFileToolbar}>
                            <IconE
                                name="dots-three-horizontal"
                                size={width * 0.07}
                                color="gold"
                                style={{ margin: width * 0.01 }}
                            />
                        </TouchableOpacity>
                        {recording ? (
                            <TouchableOpacity onPress={stopRecording}>
                                <Icon
                                    name="stop"
                                    size={width * 0.07}
                                    color="red"
                                    style={{ marginLeft: width * 0.02 }}
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={startRecording}>
                                <Icon
                                    name="mic"
                                    size={width * 0.07}
                                    color="black"
                                    style={{ marginLeft: width * 0.02 }}
                                />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={sendMessage}>
                            <Icon
                                name="send"
                                size={width * 0.07}
                                color="blue"
                                style={{ marginLeft: width * 0.02 }}
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

                {/* Action sheet */}
                <ActionSheet ref={actionSheetRef} gestureEnabled={true}>
                    <View style={{ padding: 20 }}>
                        <Text style={{ fontSize: 16 }}>Tùy chọn</Text>

                        {/* Trả lời tin nhắn */}
                        <TouchableOpacity
                            onPress={() => {}}
                            style={{
                                padding: 10,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <IconM
                                name="message-reply-text-outline"
                                size={20}
                                color="#7C00FE"
                            />

                            <Text style={{ fontSize: 16, color: "#000" }}>
                                Trả lời
                            </Text>
                        </TouchableOpacity>

                        {/* Chuyển tiếp tin nhắn */}
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("MessageForwarding", {
                                    forwardedMessage: selectedMessage,
                                });
                                actionSheetRef.current?.hide();
                            }}
                            style={{
                                padding: 10,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <IconM
                                name="reply-outline"
                                size={20}
                                color="#2196F3"
                            />
                            <Text style={{ fontSize: 16, color: "#000" }}>
                                Chuyển tiếp
                            </Text>
                        </TouchableOpacity>

                        {/* Thu hồi tin nhắn */}
                        {selectedMessage?.senderId === user?.id &&
                            !selectedMessage?.recalled && (
                                <TouchableOpacity
                                    onPress={handleRecallMessage}
                                    style={{
                                        padding: 10,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <IconM
                                        name="message-reply-text"
                                        size={20}
                                        color="#E85C0D"
                                    />

                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: "#E85C0D",
                                        }}
                                    >
                                        Thu hồi
                                    </Text>
                                </TouchableOpacity>
                            )}

                        {/* Xóa tin nhắn phía mình*/}
                        <TouchableOpacity
                            onPress={handleDeleteMessage}
                            style={{
                                padding: 10,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <Icon name="trash-outline" size={20} color="red" />
                            <Text style={{ fontSize: 16, color: "red" }}>
                                Xóa phía mình
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => actionSheetRef.current?.hide()}
                            style={{ padding: 10 }}
                        >
                            <Text style={{ fontSize: 16, color: "gray" }}>
                                Hủy
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ActionSheet>

                {/* Thanh công cụ */}
                {/* <TouchableNativeFeedback onPress={hideToolbars}>
        </TouchableNativeFeedback>  */}
                {/* Toolbar */}
                {/* Emoji/Gif Toolbar */}
                <Animated.View
                    style={{
                        height: emojiToolbarHeight,
                        backgroundColor: "#fff",
                        overflow: "hidden",
                        borderTopWidth: 1,
                        borderTopColor: "#ccc",
                    }}
                >
                    {/* Tab selection UI */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                            padding: 10,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => setContentType("emoji")}
                        >
                            <Text
                                style={{
                                    color:
                                        contentType === "emoji"
                                            ? "gold"
                                            : "gray",
                                    fontSize: 16,
                                }}
                            >
                                Emoji
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setContentType("sticker")}
                        >
                            <Text
                                style={{
                                    color:
                                        contentType === "sticker"
                                            ? "gold"
                                            : "gray",
                                    fontSize: 16,
                                }}
                            >
                                Sticker
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setContentType("gif")}>
                            <Text
                                style={{
                                    color:
                                        contentType === "gif" ? "gold" : "gray",
                                    fontSize: 16,
                                }}
                            >
                                GIF
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/* Content display area */}
                    <View
                        style={{
                            flex: 1,
                            padding: 0,
                            margin: 0,
                            backgroundColor: "transparent",
                        }}
                    >
                        {contentType === "emoji" ? (
                            <EmojiSelector
                                onEmojiSelected={onEmojiClick}
                                columns={8}
                                showSearchBar={false}
                                showTabs={false}
                                showHistory={false}
                                showSectionTitles={false}
                            />
                        ) : contentType === "sticker" ? (
                            loadingStickers ? (
                                <Text
                                    style={{ textAlign: "center", padding: 20 }}
                                >
                                    Đang tải sticker...
                                </Text>
                            ) : stickers.length > 0 ? (
                                <FlatList
                                    data={stickers}
                                    renderItem={renderStickerItem}
                                    keyExtractor={(item) => item.id}
                                    numColumns={3}
                                    contentContainerStyle={
                                        mediaItemStyles.flatListContent
                                    }
                                    style={mediaItemStyles.flatList}
                                />
                            ) : (
                                <Text
                                    style={{ textAlign: "center", padding: 20 }}
                                >
                                    Không có sticker nào
                                </Text>
                            )
                        ) : contentType === "gif" ? (
                            loadingGifs ? (
                                <Text
                                    style={{ textAlign: "center", padding: 20 }}
                                >
                                    Đang tải GIF...
                                </Text>
                            ) : gifs.length > 0 ? (
                                <FlatList
                                    data={gifs}
                                    renderItem={renderGifItem}
                                    keyExtractor={(item) => item.id}
                                    numColumns={3}
                                    contentContainerStyle={
                                        mediaItemStyles.flatListContent
                                    }
                                    style={mediaItemStyles.flatList}
                                />
                            ) : (
                                <Text
                                    style={{ textAlign: "center", padding: 20 }}
                                >
                                    Không có GIF nào
                                </Text>
                            )
                        ) : null}
                    </View>
                </Animated.View>

                {/* Image/File Toolbar */}
                <Animated.View
                    style={{
                        height: fileToolbarHeight,
                        backgroundColor: "#fff",
                        overflow: "hidden",
                        borderTopWidth: 1,
                        borderTopColor: "#ccc",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            paddingHorizontal: 20,
                            paddingTop: 15,
                            gap: 30,
                        }}
                    >
                        <TouchableOpacity
                            onPress={pickImage}
                            style={{ alignItems: "center" }}
                        >
                            <Icon name="image" size={28} color="#f66" />
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: "#000",
                                    paddingTop: 5,
                                }}
                            >
                                Hình ảnh
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={pickDocument}
                            style={{ alignItems: "center" }}
                        >
                            <Icon name="document-text" size={28} color="#36f" />
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: "#000",
                                    paddingTop: 5,
                                }}
                            >
                                Tài liệu
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={pickVideo}
                            style={{ alignItems: "center" }}
                        >
                            <IconF5 name="file-video" size={28} color="#36f" />
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: "#000",
                                    paddingTop: 5,
                                }}
                            >
                                Video
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Hiển thị thanh trạng thái */}
            </View>
            <Loading isLoading={loading} />
        </View>
    );
};

const mediaItemStyles = {
    container: {
        backgroundColor: "transparent",
        padding: 0,
        margin: 0,
    },
    image: {
        width: width / 3,
        height: width / 3,
        margin: 0,
        padding: 0,
        borderRadius: 0,
        borderWidth: 0,
        backgroundColor: "transparent",
    },
    flatList: {
        backgroundColor: "transparent",
        padding: 0,
        margin: 0,
    },
    flatListContent: {
        padding: 0,
        margin: 0,
        backgroundColor: "transparent",
        alignItems: "center",
    },
};
export default SingleChatScreen;
