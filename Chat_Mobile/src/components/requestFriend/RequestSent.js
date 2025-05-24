import React, {useMemo} from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { getReqsSent, recallReq } from "../../store/slice/friendSlice";
import Loading from "../Loading";
import { connectWebSocket, subscribeFriendsToAcceptFriendRequest } from "../../config/socket";


const {width, height} = Dimensions.get("window");
const renderItem = ({ item, recall }) => (
    <View style={styles.requestItem}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ flexDirection: "column" }}>

            <Text style={styles.displayName}>{item.displayName}</Text>  
            <Text style={styles.muttedText}>Bạn đã gửi lời mời</Text>  

            <TouchableOpacity style={{ backgroundColor: "#E9EBED", paddingVertical: 10, paddingHorizontal: width*0.2 ,borderRadius: 5, marginTop: 10 }} 
                onPress={() => recall(item.requestId)}
            >
                <Text style={{color: "#141415"}}>Thu hồi lời mời</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const RequestSent = ({ navigation }) => {
    const dispatch = useDispatch();
    const { sentRequests, isLoading } = useSelector(state => state.friend);
    const { user } = useSelector((state) => state.user);
    
    const  requests = useMemo(() => {
        if(sentRequests === null) return [];
        return sentRequests;
    }, [sentRequests]);
    
    console.log("requests", requests);

    const handleRecallRes = React.useCallback(async (requestId) => {
        try {
            await dispatch(recallReq(requestId));
            await dispatch(getReqsSent());
        } catch (error) {
            console.error("Error recalling request:", error); 
        }
    }, [dispatch])

    React.useEffect(() => {
        dispatch(getReqsSent());
    }, [dispatch]);

    React.useEffect(() => {
            connectWebSocket(() => {
                subscribeFriendsToAcceptFriendRequest(user?.id, (message) => {
                    console.log("Nhận được tin nhắn từ WebSocket:", message);
                    dispatch(getReqsSent());
                });
            });
        }, [user?.id, dispatch]);
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lời mời đã gửi ( {requests.length} )</Text>
            <FlatList
                data={requests}
                renderItem={({item}) => 
                    renderItem({ item, recall: (requestId) => {
                        handleRecallRes(requestId);
                    }})}
                
                keyExtractor={item => item.requestId}
                extraData={sentRequests}  
            />
            <Loading loading={isLoading} /> 
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    requestItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 25,
        marginRight: 10,
    },
    displayName: {
        fontSize: 18,
        fontWeight: "500",
    },
    muttedText: {
        fontSize: 14,
        color: "#888",
        marginTop: 5,
    }
});




export default RequestSent;
