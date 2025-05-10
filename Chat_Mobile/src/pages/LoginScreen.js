import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { login} from "../api/authApi";
import { storeToken, storeRefreshToken } from "../utils/authHelper";
import {useAuth} from "../contexts/AuthContext";
import { CommonActions } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation, route }) => {

  const { phoneLogin, passwordLogin } = route.params || { phoneLogin: "", passwordLogin: "" };
  
  const [phone, setPhone] = useState(phoneLogin);
  const [password, setPassword] = useState(passwordLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const isButtonEnabled = phone.trim() !== "" && password.trim() !== "";

  const {setIsLoggedIn} = useAuth();

  const handelLogin = async () => {
    try {
      console.log("Logging in with phone:", phone, "and password:", password);
      const response = await login(phone, password);
      
      console.log("Login successful:", response);
      const token = response?.response?.token;
      const refreshToken = response?.response?.refreshToken;
  
      console.log("Đăng nhập thành công!");
      console.log(" Token:", token);
      console.log(" Refresh Token:", refreshToken);
  

      await storeToken(response.response.token);

      await storeRefreshToken(response.response.refreshToken);
      setIsLoggedIn(true);

      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Main" }],
          })
        );
      },1)

    } catch (error) {
      console.error("Login failed:", error);
      alert("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.");
      setPhone("");
      setPassword("");
      setFocusedInput(null);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Đăng nhập</Text>
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Vui lòng nhập số điện thoại và mật khẩu đăng nhập
        </Text>
      </View>

      {/* Input Fields */}
      <TextInput
        style={[styles.input, focusedInput === "phone" && styles.inputFocused]}
        placeholder="Số điện thoại"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        onFocus={() => setFocusedInput("phone")}
        onBlur={() => setFocusedInput(null)}
        autoFocus={true}
      />

      <View
        style={[
          styles.passwordContainer,
          focusedInput === "password" && styles.inputFocused,
        ]}
      >
        <TextInput
          style={styles.passwordInput}
          placeholder="Mật khẩu"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocusedInput("password")}
          onBlur={() => setFocusedInput(null)}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.showText}>{showPassword ? "ẨN" : "HIỆN"}</Text>
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen", {nextScreen: "LoginScreen"})}>
        <Text style={styles.forgotText}>Lấy lại mật khẩu</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handelLogin }
        style={[
          styles.loginButton,
          { backgroundColor: isButtonEnabled ? "#007AFF" : "#B0C4DE" },
        ]}
        disabled={!isButtonEnabled}
      >
        <Text style={styles.loginText}>Đăng nhập</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footerText}>Các câu hỏi thường gặp</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingLeft: height * 0.03,
    height: height * 0.1,
    paddingTop: height * 0.04,
  },
  headerText: {
    color: "white",
    fontSize: height * 0.025,
    fontWeight: "bold",
    marginLeft: 10,
  },
  subtitleContainer: {
    backgroundColor: "#F8FAFC",
  },
  subtitle: {
    marginTop: height * 0.01,
    color: "#000",
    fontSize: height * 0.02,
    padding: width * 0.02,
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: height * 0.015,
    marginTop: height * 0.02,
    fontSize: height * 0.02,
    margin: width * 0.02,
  },
  inputFocused: {
    borderBottomColor: "#00AEEF",
    borderBottomWidth: 2,
  },
  passwordContainer: {
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    marginTop: height * 0.01,
    margin: width * 0.02,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: height * 0.015,
    fontSize: height * 0.02,
  },
  showText: {
    color: "gray",
    fontWeight: "bold",
    fontSize: height * 0.018,
    paddingRight: height * 0.01,
  },
  forgotText: {
    marginTop: height * 0.015,
    fontSize: height * 0.02,
    margin: width * 0.03,
    color: "#007AFF",
    fontWeight: "bold",
  },
  loginButton: {
    padding: height * 0.01,
    borderRadius: 30,
    marginLeft: height * 0.1,
    marginRight: height * 0.1,
    alignItems: "center",
    marginTop: height * 0.03,
  },
  loginText: {
    color: "white",
    fontSize: height * 0.022,
    fontWeight: "bold",
  },
  footerText: {
    textAlign: "center",
    marginTop: height * 0.41,
    color: "gray",
    fontSize: width * 0.04,
  },
});

export default LoginScreen;
