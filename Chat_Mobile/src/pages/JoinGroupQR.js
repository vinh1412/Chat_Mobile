import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import QRCode from 'react-native-qrcode-svg'; // thêm dòng này

const JoinGroupQR = ({navigation, route}) => {
  const { linkGroup ,idconversation} = route.params;
  const groupLink = `${linkGroup.linkGroup}`;

  
  console.log("Link nhóm nhận được:", groupLink);
  // idconversation 

  console.log("Conversation ID:", idconversation);  

  const handleOpenLink = () => {
    Linking.openURL(groupLink);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(groupLink);
    alert('Đã sao chép link!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <FontAwesome name="group" size={45} color="#ccc" />
        </View>
      </View>

      <Text style={styles.groupName}>Nhóm 3_Công nghệ mới 😊</Text>
      <Text style={styles.description}>Mời mọi người tham gia nhóm bằng mã QR hoặc link dưới đây:</Text>

      {/* QR Code động */}
      <QRCode
        value={groupLink}
        size={200}
      />

      <TouchableOpacity onPress={handleOpenLink}>
        <Text style={styles.linkText}>{groupLink.replace('https://', '')}</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleCopyLink}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="content-copy" size={20} color="black" />
          </View>
          <Text style={styles.buttonText}>Sao chép link</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleOpenLink}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="share-outline" size={20} color="black" />
          </View>
          <Text style={styles.buttonText}>Chia sẻ link</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleOpenLink}>
          <View style={styles.iconWrapper}>
            <AntDesign name="arrowdown" size={20} color="black" />
          </View>
          <Text style={styles.buttonText}>Tải xuống</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
    justifyContent: 'center',   // căn giữa theo chiều dọc
    alignItems: 'center',       // căn giữa theo chiều ngang
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  linkText: {
    color: '#007AFF',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flexDirection: 'column', // icon trên, text dưới
    alignItems: 'center',
    padding: 10,
    flex: 1,
  },
  
  iconWrapper: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 30, // để tròn
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  
  buttonText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

export default JoinGroupQR;
