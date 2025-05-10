import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { getReqsReceived, acceptReq, rejectReq } from "../../store/slice/friendSlice";
import Loading from "../Loading";


const {width, height} = Dimensions.get("window");
const renderItem = ({ item, accept, reject }) => {
   return (

        <View style={styles.requestItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={{ flexDirection: "column" }}>
    
                <Text style={styles.displayName}>{item.displayName}</Text>  
                <Text style={styles.muttedText}>Muốn kết bạn</Text>  
    
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 10 }}>
                    <TouchableOpacity style={{ backgroundColor: "#D6E9FF", paddingVertical: 10, paddingHorizontal: width*0.1 ,borderRadius: 5 }} 
                        onPress={() => {
                            accept(item.requestId);
                         }}
                    >
                        <Text style={{color: "#006AF5"}}>Xác nhận</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: "#FED8D7", paddingVertical: 10, borderRadius: 5, paddingHorizontal: width*0.1 }} 
                        onPress={() => {
                           reject(item.requestId);
                        }}
                    >
                        <Text style={{color: "#DC1F18"}}>Từ chối</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
};

const RequestReceived = ({ navigation }) => {
    const dispatch = useDispatch();
    const { receivedFriendRequests, isLoading } = useSelector(state => state.friend);
    const  requests = useMemo(() => {
        if(receivedFriendRequests === null) return [];
        return receivedFriendRequests;
    }, [receivedFriendRequests]);
    
    console.log("requests", requests);

    const handleAcceptReq = useCallback(async (requestId) => {
        try {

           const response = await dispatch(acceptReq(requestId));

           await dispatch(getReqsReceived());
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    }, [dispatch])

    const handleRejecttReq = useCallback(async (requestId) => {
        try {

           const response = await dispatch(rejectReq(requestId));

           await dispatch(getReqsReceived());
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    }, [dispatch])

    React.useEffect(() => {
        dispatch(getReqsReceived());
    }, [dispatch]);
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lời mời đã nhận ( {requests.length} )</Text>
            <FlatList
                data={requests}
                renderItem={({ item }) => 
                    renderItem({ item, 
                        accept:  (requestId) => handleAcceptReq(requestId), 
                        reject:  (requestId) => handleRejecttReq(requestId) })}
                keyExtractor={item => item?.requestId || Math.random().toString()}
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




export default RequestReceived;
