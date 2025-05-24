import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  Entypo,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';

const PostStatusScreen = () => {
  const fonts = [
    { name: 'Fountain', key: 'f1' },
    { name: 'Pixel', key: 'f2' },
    { name: 'Vintage', key: 'f3' },
    { name: 'Terminal', key: 'f4' },
    { name: 'Florence', key: 'f5' },
    { name: 'Retro', key: 'f6' },
    { name: 'Graffiti', key: 'f7' },
    { name: 'Signature', key: 'f8' },
  ];

  const fontColors = {
    Fountain: ['#FF6347', '#FFA07A'],     // Đỏ cam – Cam nhạt
    Pixel: ['#1E90FF', '#87CEFA'],        // Xanh dương – Xanh trời
    Vintage: ['#8B4513', '#D2B48C'],      // Nâu đất – Nâu vàng
    Terminal: ['#32CD32', '#7CFC00'],     // Xanh lá – Xanh nõn chuối
    Florence: ['#BA55D3', '#DDA0DD'],     // Tím hoa cà – Tím nhạt
    Retro: ['#FFD700', '#FFA500'],        // Vàng chanh – Cam
    Graffiti: ['#DC143C', '#FF69B4'],     // Đỏ thắm – Hồng cánh sen
    Signature: ['#000000', '#696969'],    // Đen – Xám tro
  };

  const [text, setText] = useState('');
  const [selectedFont, setSelectedFont] = useState('Fountain');
  const navigation = useNavigation();

  const fontMap = Object.fromEntries(fonts.map(f => [f.name, f.key]));

  const [loaded] = useFonts({
    f1: require('../../../assets/font/f1.ttf'),
    f2: require('../../../assets/font/f2.ttf'),
    f3: require('../../../assets/font/f3.ttf'),
    f4: require('../../../assets/font/f4.ttf'),
    f5: require('../../../assets/font/f5.ttf'),
    f6: require('../../../assets/font/f6.ttf'),
    f7: require('../../../assets/font/f7.ttf'),
    f8: require('../../../assets/font/f8.ttf'),
  });

  if (!loaded) return null;

  const handlePost = () => {
    if (!text.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung trước khi đăng.');
      return;
    }
    console.log('Post nội dung:', text);
    console.log('Font:', selectedFont);
    Alert.alert('Đã đăng', 'Nội dung của bạn đã được đăng!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <Text style={styles.headerText}>Tất cả bạn bè</Text>

        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.postButton}>Đăng</Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          {
            fontFamily: fontMap[selectedFont],
            color: fontColors[selectedFont][0],
          },
        ]}
        placeholder="Bạn đang nghĩ gì?"
        placeholderTextColor="#aaa"
        value={text}
        onChangeText={setText}
        multiline
      />

      {/* Font Selection */}
      <ScrollView horizontal style={styles.fontRow} showsHorizontalScrollIndicator={false}>
        {fonts.map((font) => (
          <TouchableOpacity
            key={font.name}
            style={[
              styles.fontButton,
              selectedFont === font.name && styles.selectedFont,
            ]}
            onPress={() => setSelectedFont(font.name)}
          >
            <Text style={{
              fontFamily: font.key,
              fontSize: 16,
              color: fontColors[font.name][0],
            }}>
              {font.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Options */}
      <View style={styles.options}>
        <TouchableOpacity style={styles.option}>
          <Entypo name="music" size={20} color="#918b8b" />
          <Text> Nhạc</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <MaterialIcons name="photo-album" size={20} color="#918b8b" />
          <Text> Album</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Entypo name="tag" size={20} color="#918b8b" />
          <Text> Với bạn bè</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity>
          <FontAwesome5 name="smile" size={24} />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="image" size={24} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="videocam" size={24} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Entypo name="link" size={24} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Entypo name="location-pin" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  postButton: {
    color: '#1e90ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    height: '70%',
    textAlignVertical: 'top',
    fontSize: 16,
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fontRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  fontButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    height: 40,
    justifyContent: 'center',
  },
  selectedFont: {
    backgroundColor: '#1e90ff',
    borderColor: '#1e90ff',
    borderWidth: 1,
  },
  options: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  option: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#918b8b',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 10,
    borderColor: '#ccc',
    marginTop: 'auto',
  },
});

export default PostStatusScreen;
