import React, { useState, useMemo, useEffect } from "react";
import { Modal } from "react-native";

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  
} from "react-native";
import Header from "../../components/Header";
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from 'react-redux';
import {getPostsMyByUserId, getFriendsByUserId, getAllPosts, getUserById} from '../../api/postApi';
const DiaryMy = () => {

const [modalVisible, setModalVisible] = useState(false);
const [selectedPost, setSelectedPost] = useState(null);
const navigation = useNavigation();

// lấy user hiện tại từ Redux store
  const dispatch = useDispatch();
  const userProfile = useSelector(state => state.user.user);
  const user = useMemo(() => {
          return userProfile || null;
  }, [userProfile]);
  console.log("Nhật ký: USER hiện tại--------------------" , userProfile);
/*
 (NOBRIDGE) LOG  Nhật ký: USER hiện tại-------------------- {"avatar": "https://res.cloudinary.com/dovnjo6ij/image/upload/v1744734307/yviw4m4qp63sx1xmj6mb.jpg", "display_name": "Tran Minh Tiến", "dob": "2003-02-06", "enabled": true, "gender": "MALE", "id": "67fb51ce6993e15db49bf32f", "password": "$2a$10$BBWzlF0pJxQq9sriX40YQOUQ40BaBJXpUFUMFGjLW/c88AlBr3Ng.", "phone": "+84869188704", "roles": ["ROLE_USER"]}
*/
  // Lấy bài viết của người dùng hiện tại
  const [userPosts, setUserPosts] = useState([]);

  // Lấy bài viết của người dùng hiện tại
  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await getPostsMyByUserId(user?.id);
        setUserPosts(postsData);
      } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
      }
    };
    if (user?.id) {
      fetchPosts();
    }
  }, [user?.id]);

  console.log("**************************************Bài viết của người dùng hiện tại:", userPosts);

  // Lấy danh sách bạn bè của người dùng hiện tại
  const [friends, setFriends] = useState([]);
  React.useEffect(() => {
    const fetchFriends = async () => {
      try {
        const result = await getFriendsByUserId(user?.id);
        setFriends(result.response || []);     // nếu dùng như bên dưới sẽ không lấy được do postmain khi test {               ...............} KHÔNG Phải là [..............]
        /*
        const friendsData = await getFriendsByUserId(user?.id);
        setFriends(friendsData); //
        */
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
      }
    };
    if (user?.id) {
      fetchFriends();
    }
  }, [user?.id]);
  console.log("............................danh sách bạn bè:...................................", friends);



  // Lấy tất cả bài viết
  const [allPosts, setAllPosts] = useState([]);
  React.useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const allPostsData = await getAllPosts();
        setAllPosts(allPostsData);
      } catch (error) {
        console.error("Lỗi khi lấy tất cả bài viết:", error);
      }
    };
    fetchAllPosts();
  }, []);
  console.log("**************************************Tất cả bài viết:", allPosts);
// chỉ lấy bài viết của bạn bè dựa vào friends và allPosts 

  
// Lọc bài viết của bạn bè
const [friendPosts, setFriendPosts] = useState([]);

useEffect(() => {
  if (friends.length > 0 && allPosts.length > 0) {
    const friendIds = friends.map(friend => friend.userId);
    const postsFromFriends = allPosts.filter(post => friendIds.includes(post.userId));
    setFriendPosts(postsFromFriends);
  }
}, [friends, allPosts]);

console.log("**************************************Bài viết của bạn bè:", friendPosts);
 



//getUserById

const [friendUsers, setFriendUsers] = useState({});
const fetchFriendUsers = async () => {
  try {
    const users = await Promise.all(
      friends.map(friend => getUserById(friend.userId))
    );
    const usersMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
    setFriendUsers(usersMap);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
  }
};

useEffect(() => {
  if (friends.length > 0) {
    fetchFriendUsers();
  }
}, [friends]);


  return (

      <SafeAreaView style={styles.container}>
        <Header iconRight="user" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Post Box */}
          <View style={styles.postBox}>
            {/* lấy img từ useProfile */}
            <Image
              source={{ uri: user?.avatar }}
              style={styles.avatar}
            />
            <TouchableOpacity  style={styles.input} 
                    onPress={() => navigation.navigate('PostStatusScreen')}
            >
              <Text>
                Hôm nay bạn thế nào?
              </Text>
            </TouchableOpacity>

          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} >
              <Text style={styles.actionText}>📷 Ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} >
              <Text style={styles.actionText}>🎥 Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} >
              <Text style={styles.actionText}>📁 Album</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} >
              <Text style={styles.actionText}>🕓 Kỷ niệm</Text>
            </TouchableOpacity>
          </View>

          {/* Stories */}
          <ScrollView horizontal style={styles.stories} showsHorizontalScrollIndicator={false}>
            {/* Story đầu tiên: Tạo mới */}
            <TouchableOpacity style={styles.storyList}>
              <Image
                source={{ uri: user?.avatar }}
                style={styles.avatarList}
              />
              <Text style={styles.storyTextList}>Tạo mới</Text>
            </TouchableOpacity>

            {/* Các story từ mảng posts */}
            {friends.map((friend) => (
              <TouchableOpacity key={friend.userId} style={styles.storyList}>
                <Image source={{ uri: friend.avatar }} style={styles.avatarList} />
                <Text style={styles.storyTextList}>{friend.displayName}</Text>
              </TouchableOpacity>
            ))}
      </ScrollView>

          {/* Posts from my */}
          {userPosts.map((post) => (
            <View key={post.idPost} style={styles.post}>
              <View style={styles.postHeader}>
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatarSmall}
                />
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    {/* <Text style={styles.postName}>{post.fonts}</Text> */}
                    <Text style={styles.postName}>{user.display_name}</Text>
                    <Text style={styles.postTime}>{post.createdAt}</Text>
                  </View>
                  <TouchableOpacity>
                    <Entypo name="dots-three-vertical" size={15} color="black" />
                  </TouchableOpacity>          
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>

              {/* Example of accessing idPost and idUser */}
              <Text style={{ fontSize: 10, color: "gray", marginTop: 5 }}>
                Post ID: {post.idPost} | User ID: {post.idUser}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity style={styles.likeContainer}>
                  <Ionicons name="heart-outline" size={20} color="#000" />
                  <Text style={styles.likeText}>Thích</Text>
                  <View style={styles.divider} />
                  <Ionicons name="heart" size={20} color="red" />
                  <Text style={styles.likeCount}>2</Text>
                </TouchableOpacity>

              <TouchableOpacity
                style={styles.commentContainer}
                onPress={() => {
                  setSelectedPost(post);
                  setModalVisible(true);
                }}
              >
                <Ionicons name="chatbox-ellipses-outline" size={20} color="#000" />
              </TouchableOpacity>

              </View>
            </View>
          ))}

          {/* Posts FRIEND*/}
          {friendPosts.map((post) => (
            
            <View key={post.idPost} style={styles.post}>
              <View style={styles.postHeader}>
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatarSmall}
                />
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    {/* <Text style={styles.postName}>{post.fonts}</Text> */}
                    <Text style={styles.postName}>{post.userId}</Text>
                    <Text style={styles.postTime}>{post.createdAt}</Text>
                  </View>
                  <TouchableOpacity>
                    <Entypo name="dots-three-vertical" size={15} color="black" />
                  </TouchableOpacity>          
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>

              {/* Example of accessing idPost and idUser */}
              <Text style={{ fontSize: 10, color: "gray", marginTop: 5 }}>
                Post ID: {post.idPost} | User ID: {post.idUser}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity style={styles.likeContainer}>
                  <Ionicons name="heart-outline" size={20} color="#000" />
                  <Text style={styles.likeText}>Thích</Text>
                  <View style={styles.divider} />
                  <Ionicons name="heart" size={20} color="red" />
                  <Text style={styles.likeCount}>2</Text>
                </TouchableOpacity>

              <TouchableOpacity
                style={styles.commentContainer}
                onPress={() => {
                  setSelectedPost(post);
                  setModalVisible(true);
                }}
              >
                <Ionicons name="chatbox-ellipses-outline" size={20} color="#000" />
              </TouchableOpacity>

              </View>
            </View>
          ))}

          
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Bình luận bài viết</Text>
                <Text style={{ fontSize: 12, color: '#888' }}>
                  Bài viết từ: {selectedPost?.name}
                </Text>
                <TextInput
                  placeholder="Nhập bình luận..."
                  style={styles.commentInput}
                  multiline
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.sendButtonText}>Gửi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </SafeAreaView>  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: StatusBar.currentHeight || 0,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  postBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  actionBtn: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
  },
  stories: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  story: {
    width: 70,
    height: 100,
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyText: {
    fontSize: 12,
    textAlign: 'center',
  },


  storyList: {
    width: 100,
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end', 
    alignItems: 'center',
    position: 'relative',
    marginRight: 10,
  },
  avatarList: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,                     // độ mờ
    zIndex: 0,
  },

  storyTextList: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    zIndex: 1,
  },





  post: {
    backgroundColor: '#fff',
    // borderRadius: 10,
    padding: 10,
    // marginVertical: 10,
    // marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
    // height: 300
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarSmall: {
    width: 35,
    height: 35,
    borderRadius: 18,
    marginRight: 10,
  },
  postName: {
    fontWeight: 'bold',
  },
  postTime: {
    fontSize: 12,
    color: 'gray',
  },
  postContent: {
    fontSize: 14,
    marginTop: 6,
  },

  // Like and Comment

    likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  likeText: {
    marginLeft: 5,
    marginRight: 10,
    fontSize: 14,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#000',
  },
  commentContainer: {
    borderRadius: 20,
    padding: 6,
    backgroundColor: '#f2f2f2',
  },


  // modal

modalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'flex-end',  // <-- sửa chỗ này
  alignItems: 'center',
},

modalContent: {
  width: '100%',
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 20,
  alignItems: 'stretch',
  
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},
commentInput: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 10,
  minHeight: 80,
  marginBottom: 10,
  textAlignVertical: 'top',
},
sendButton: {
  backgroundColor: '#3b82f6',
  padding: 10,
  borderRadius: 8,
  alignItems: 'center',
},
sendButtonText: {
  color: 'white',
  fontWeight: 'bold',
}

});

export default DiaryMy;
