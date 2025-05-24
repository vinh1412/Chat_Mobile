import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { saveQaCode } from '../api/qaCode';
import { getToken } from '../utils/authHelper';
import { findConversationIdByLinkGroup, addMemberGroup } from '../api/qaCode';

export default function QRScannerScreen({ route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const navigation = useNavigation();

  const { userId } = route.params;
  console.log("userId", userId);

  const handleBarCodeScanned = async ({ data }) => {
    const token = await getToken();

    if (scanned || loading) return;

    setScanned(true);
    setScannedData(data);
    setLoading(true);

    // If QR code is for login, process it
    let success = false;
    if (!data.includes('iuhgroup3_')) {
      success = await saveQaCode(data, userId, token);
    }

    setLoading(false);

    // If the data contains "iuhgroup3_", process group joining
    if (data.includes('iuhgroup3_')) {
      const groupId = data.replace('iuhgroup3_', ''); // Assuming the link group is after the prefix
      const conversationId = await findConversationIdByLinkGroup(data);
      console.log("data===================================", data);      
      console.log("conversationId===================================", conversationId?.id);
      console.log("groupId-------------------------------------------------------------------------------================================", groupId);
      console.log("id user-------------------------------------------------------------------------------================================", userId);
      
      if (conversationId?.id) {
        // Add user to group
        const addSuccess = await addMemberGroup(conversationId?.id, userId);
        if (addSuccess) {
          Alert.alert("Tham gia nhóm", "Bạn đã quét mã QR hợp lệ để tham gia nhóm.", [
            {
              text: "OK",
              onPress: () => {
                navigation.goBack(); // Quay về màn hình trước
              }
            }
          ]);
        } else {
          Alert.alert("Lỗi", "Không thể thêm bạn vào nhóm.");
        }
      } else {
        Alert.alert("Lỗi", "Không tìm thấy nhóm.");
      }
    } else if (success) {
      Alert.alert("Thành công", "Cho phép đăng nhập trên laptop.", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack(); // Quay về màn hình trước
          }
        }
      ]);
    } else {
      Alert.alert("Lỗi", "Không gửi được session ID.");
    }

    // Reset scanning state after a delay
    setTimeout(() => {
      setScanned(false);
      setScannedData(null);
    }, 5000);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.centered}>
        <Text>Chưa có quyền truy cập camera.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      <View style={styles.resultBox}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.resultText}>
            {scannedData ? `Session ID: ${scannedData}` : '------------------------------------'}
            {userId ? ` ID user: ${userId}` : ''}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  resultBox: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    alignItems: 'center',
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'tomato',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
});
