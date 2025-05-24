import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import IconA from "react-native-vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native"; //  Đảm bảo đã import

const { width, height } = Dimensions.get("window");  
const Header = ({ iconLeft, onIconLeftPress, iconRight, onIconRightPress }) => {
  const navigation = useNavigation(); //  Di chuyển vào trong hàm Header

  return (
    <LinearGradient
      colors={["#006AF5", "#5FCBF2"]}
      locations={[0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
    <TouchableOpacity 
      style={styles.left} 
      onPress={() => {
        console.log("Navigating to FindInfo...");
        navigation.navigate("FindInfo");
      }}
    >
      <IconA name="search1" size={24} color="#fff" />
      <TextInput
        placeholder="Tìm kiếm"
        placeholderTextColor={"#B8D9FF"}
        style={styles.search}
        editable={false}
      />
    </TouchableOpacity>


      <View style={styles.right}>
        {/* Icon trai */}
        {iconLeft ? (
          <TouchableOpacity onPress={onIconLeftPress}>

            {/* HÀM OnIconLeftPress gọi bên ConvertionScreen */}
            <IconA
                name={iconLeft}
                size={24}
                color="#fff"
                
                
            />
          </TouchableOpacity>
        ) : <View style={styles.iconPlaceholder} />}

        {/* Icon phải */}
        {iconRight ? (
          <TouchableOpacity onPress={onIconRightPress}>
            <IconA
                name={iconRight}
                size={24}
                color="#fff"                
                
            />
          </TouchableOpacity>
        ) : <View style={styles.iconPlaceholder} />}

      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 16 },
  right: { flexDirection: "row", alignItems: "center", gap: 16 },
  search: {
    color: "#B8D9FF",
    paddingBottom: 5,
    fontSize: 18,
    height: width * 0.08,
    width: width * 0.5,
    borderRadius: 8,
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
  }
});

export default Header;
