import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use this for physical devices or define your local IP address.
// For Android Emulator: 10.0.2.2
// For iOS Simulator: localhost or your local IP address
// const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5274/api' : 'http://localhost:5274/api';
const API_URL = 'http://10.30.231.253:5274/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

axiosClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error fetching token from SecureStore', error);
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi tập trung ở đây nếu cần
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ -> Xử lý logout
      SecureStore.deleteItemAsync('userToken');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
