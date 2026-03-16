import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function IndexScreen() {
  const user = useAuthStore((state: any) => state.user);
  const [isReady, setIsReady] = useState(false);

  // Tạo một chút độ trễ nhỏ để đợi Zustand load dữ liệu từ LocalStorage lên
  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#15476C" />
      </View>
    );
  }

  // Nếu đã có thông tin user -> Bay thẳng vào Home
  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Nếu chưa đăng nhập -> Bắt ra Login
  return <Redirect href="/(auth)/login" />;
}