import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';


export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="transaction/create" 
        options={{ 
          presentation: 'modal', 
          animation: 'slide_from_bottom',
          headerShown: false
        }} 
      />
    </Stack>
  );
}