import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axiosClient from '../api/axiosClient';

interface User {
  userId?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string | null;
  primaryWalletId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  loadToken: () => Promise<void>;
}

// Helper: fetch profile và trả về User object
const fetchProfile = async (token: string): Promise<User | null> => {
  try {
    const response = await axiosClient.get('/User/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { userId, email, fullName, avatarUrl, primaryWalletId } = response.data;
    return { userId, email, fullName, avatarUrl, primaryWalletId };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axiosClient.post('/Auth/login', { email, password });

      const { token } = response.data;

      // Lưu token trước
      await SecureStore.setItemAsync('userToken', token);
      set({ token });

      // ✅ Fetch /User/me để lấy primaryWalletId
      const user = await fetchProfile(token);
      set({ user, isLoading: false });

      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
      set({
        error: typeof errorMessage === 'string' ? errorMessage : 'Lỗi không xác định',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null });
      await axiosClient.post('/Auth/register', {
        fullName: name,
        email,
        password,
        nickname: name,
      });

      set({ isLoading: false });
      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        'Đăng ký thất bại. Vui lòng thử lại!';
      set({
        error: typeof errorMessage === 'string' ? errorMessage : 'Lỗi không xác định',
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
    } catch (error) {
      console.error('Error removing token from secure store', error);
    } finally {
      set({ user: null, token: null, error: null });
    }
  },

  clearError: () => set({ error: null }),

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        set({ token });

        // ✅ Fetch profile khi app khởi động lại (đã có token cũ)
        const user = await fetchProfile(token);
        if (user) {
          set({ user });
        }
      }
    } catch (error) {
      console.error('Error loading token', error);
    }
  },
}));