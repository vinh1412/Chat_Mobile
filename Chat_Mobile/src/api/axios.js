import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRefreshToken, storeToken } from "../utils/authHelper";


const HOST_IP = "192.168.1.67"; // nhập ipconfig trên cmd để lấy địa chỉ ipv4

const chatEndpoint = `http://${HOST_IP}:8080`;

const instance = axios.create({
  baseURL: chatEndpoint,
});

instance.interceptors.request.use(async (config) => {
  const accessToken = await AsyncStorage.getItem("accessToken");

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // xử lý lỗi 401 (Unauthorized) và khi token hết hạn
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !(
        originalRequest.url.includes("/api/v1/auth/refresh-token") ||
        originalRequest.url.includes("/api/v1/auth/sign-in")
      )
    ) {
      originalRequest._retry = true; // đánh dấu request này đã được thử lại
      // có thể gọi hàm refresh token ở đây và thử lại request
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${chatEndpoint}/api/v1/auth/refresh-token`,
            { refreshToken: refreshToken }
          );

          if (response.status === 200) {
            const newAccessToken = response.data.response.accessToken;
            await storeToken(newAccessToken);

            // cập nhật access token cho các request tiếp theo
            instance.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            // thử lại request ban đầu với access token mới
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;

            // Gọi lại request ban đầu với access token mới
            return instance(originalRequest);
          }
        } catch (err) {
          console.error("Error refreshing token:", err);
        }
      }
    }
    console.error("API call failed:", error);
    return Promise.reject(error);
  }
);

export default instance;
