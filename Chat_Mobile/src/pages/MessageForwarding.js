import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';
import { getMyFriends } from '../store/slice/friendSlice'; 
import Loading from '../components/Loading'; 
import { forwardMessage } from '../api/chatApi';
import { forwardMessageToWebSocket } from '../config/socket';


const renderFriendItem = ({ item, toggleFriendSelection, selectedFriends }) => {
    const isSelected = selectedFriends.includes(item.userId);
    return (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => toggleFriendSelection(item.userId)}
      >
        <Image
          source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.chatInfo}>
          <Text style={styles.contactName}>{item.displayName}</Text>
        </View>
        <View style={[styles.checkbox, isSelected ? styles.checkboxSelected : null]} />
      </TouchableOpacity>
    );
  };

  const GroupItem = ({ item, isSelected, toggleGroupSelection }) => {
  
    return (
      <TouchableOpacity key={item?.id} style={styles.groupItem}
        onPress={() => {
          toggleGroupSelection(item?.id);
        }}
      >
        <View style={styles.groupAvatars}>
          {item.members.slice(0, 4).map((member, index) => (
            <Image key={index} source={{ uri: member.avatar }} style={styles.groupAvatar} />
            ))}
          </View>
  
          <View style={styles.groupContent}>
            <Text style={styles.groupName}>{item?.name}</Text>
            <Text style={styles.groupMessage}>{item?.message}</Text>
          </View>
  
          <Text style={styles.groupTime}>{item?.time}</Text>
          <View style={[styles.checkbox, isSelected ? styles.checkboxSelected : null]} />
      </TouchableOpacity>
  
    )
  };

const MessageForwarding = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { friends, isLoading } = useSelector((state) => state.friend);
  const { user } = useSelector((state) => state.user);
  const { conversations } = useSelector((state) => state.conversation);
  
  const [activeTab, setActiveTab] = useState('Bạn bè');
  const [message, setMessage] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [forwarding, setForwarding] = useState(false);

  const forwardedMessage = route.params?.forwardedMessage;
  console.log('Forwarded message:', forwardedMessage);

  const groups = useMemo(() => {
      if(Array.isArray(conversations)) {
        return conversations.filter((item) => item.is_group);
      }
      return [];
  }, [conversations]);

  useEffect(() => {
    dispatch(getMyFriends());
  }, [dispatch]);

  const filteredFriends = friends.filter(friend => {
    if (activeTab === 'Nhóm mới') return friend.type === 'group' || friend.type === 'contact' || !friend.type;
    if (activeTab === 'Bạn bè') return friend.type === 'contact' || !friend.type;
    // if (activeTab === 'App khác') return friend.type === 'app';
    return true;
  });

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const toggleGroupSelection = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleForwardMessage = async () => {
    if (selectedFriends.length === 0 && selectedGroups.length === 0) {
      alert('Vui lòng chọn ít nhất một người hoặc nhóm nhận!');
      return;
    }

    if (!forwardedMessage) {
      alert('Không có tin nhắn để chuyển tiếp!');
      return;
    }

    if (!user?.id) {
      alert('Không thể xác định người gửi. Vui lòng đăng nhập lại.');
      return;
    }

    setForwarding(true);
    try {
      for (const friendId of selectedFriends) {
        // console.log(`Forwarding message to ${friendId}`);
        const requestData = {
          messageId: forwardedMessage.id,
          senderId: user.id,
          receiverId: friendId,
          content: forwardedMessage.content || '', // Content for text messages
          messageType: forwardedMessage.messageType, // Pass the message type (TEXT, IMAGE, AUDIO)
          fileUrl: forwardedMessage.fileUrl || null, // Pass the fileUrl for images/audio
          additionalMessage: message.trim(), // Optional additional message
        }
        // await forwardMessage(requestData);

        forwardMessageToWebSocket(requestData);
      }

      alert('Tin nhắn đã được chuyển tiếp thành công!');
      navigation.goBack();
    } catch (error) {
      console.error('Error forwarding message:', error.message);
      alert('Đã có lỗi xảy ra khi chuyển tiếp tin nhắn: ' + error.message);
    } finally {
      setForwarding(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chia sẻ</Text>
        <Text style={styles.selectedCount}>Đã chọn: {selectedFriends.length}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="#A0A0A0"
          style={styles.searchInput}
        />
      </View>

      {forwardedMessage ? (
        <View style={styles.forwardedMessageContainer}>
          <Text style={styles.forwardedMessageLabel}>Tin nhắn chuyển tiếp:</Text>
          {forwardedMessage.messageType === 'TEXT' && (
            <Text style={styles.forwardedMessageText}>{forwardedMessage.content}</Text>
          )}
          {forwardedMessage.messageType === 'IMAGE' && (
            <Image
              source={{ uri: forwardedMessage.fileUrl }}
              style={styles.forwardedMessageImage}
            />
          )}
          {forwardedMessage.messageType === 'AUDIO' && (
            <Text style={styles.forwardedMessageText}>[Tin nhắn thoại]</Text>
          )}
        </View>
      ) : (
        <Text style={styles.emptyText}>Không có tin nhắn để chuyển tiếp</Text>
      )}

      <View style={styles.tabContainer}>
        {['Bạn bè', 'Nhóm'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab ? styles.activeTab : null]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab ? styles.activeTabText : null, { fontSize: 16 }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Gần đây</Text>
      </View>
      {activeTab === 'Bạn bè' ? (

        <FlatList
          data={filteredFriends}
          renderItem={({item}) => renderFriendItem({ item, toggleFriendSelection, selectedFriends })}
          keyExtractor={item => item.userId.toString()}
          style={styles.chatList}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có bạn bè để hiển thị</Text>}
        />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GroupItem item={item} isSelected={selectedGroups.includes(item.id)} toggleGroupSelection={toggleGroupSelection} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có nhóm để hiển thị</Text>}
          style={styles.chatList}
        />
      )}

      <View style={styles.bottomContainer}>
        <TextInput
          placeholder="Thêm tin nhắn (tùy chọn)"
          placeholderTextColor="#A0A0A0"
          style={styles.messageInput}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          style={[styles.forwardButton, forwarding ? styles.forwardButtonDisabled : null]}
          onPress={handleForwardMessage}
          disabled={forwarding}
        >
          <Icon name="arrow-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Loading isLoading={isLoading || forwarding} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    marginTop: StatusBar.currentHeight || 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9EBED',
  },
  headerTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  selectedCount: {
    color: '#A0A0A0',
    fontSize: 14,
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    margin: 15,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
  forwardedMessageContainer: {
    backgroundColor: '#EBF4FF',
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  forwardedMessageLabel: {
    color: '#000',
    fontSize: 14,
    marginBottom: 5,
    fontSize: 16,

  },
  forwardedMessageText: {
    color: '#006AF5',
    fontSize: 16,
  },
  forwardedMessageImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    // borderBottomWidth: 1,
    // borderBottomColor: '#3A4445',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
  },
  sectionHeader: {
    padding: 15,
  },
  sectionHeaderText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  chatList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  chatInfo: {
    flex: 1,
  },
  contactName: {
    color: '#000',
    fontSize: 17,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#A0A0A0',
    borderRadius: 12,
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E9EBED',
  },
  messageInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F4F5F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  forwardButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 10,
  },
  forwardButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  emptyText: {
    color: '#A0A0A0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  groupItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  groupAvatars: {
    width: 53,
    height: 53,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  groupAvatar: {
    width: 21,
    height: 21,
    borderRadius: 12,
    margin: 1,
  },
  groupContent: {
    flex: 1,
    marginLeft: 13,
  },
  groupName: {
    fontWeight: "bold",
    fontSize: 17,
  },
  groupMessage: {
    color: "gray",
    fontSize: 15,
  },
  groupTime: {
    color: "gray",
    fontSize: 13,
  },
});

export default MessageForwarding;