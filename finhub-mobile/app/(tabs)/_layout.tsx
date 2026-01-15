import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS } from '@/constants/theme';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  
  const isRouteActive = (routeName: string) => {
    const routeIndex = state.routes.findIndex(r => r.name === routeName);
    return state.index === routeIndex;
  };

  const onTabPress = (routeName: string) => {
    const route = state.routes.find(r => r.name === routeName);
    if (route) {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isRouteActive(routeName) && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    } else {
      console.warn(`Route ${routeName} chưa được tạo file trong thư mục (tabs)!`);
    }
  };

  return (
    <View style={styles.tabBar}>
      <View style={styles.navDividerLeft} />
      <View style={styles.navDividerRight} />

      {/* --- NÚT 1: WALLET (HOME) --- */}
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('home')}
        activeOpacity={0.7}
      >
        {isRouteActive('home') ? <View style={styles.activeDot} /> : <View style={styles.dummyDot} />}
        <Feather name="home" style={[styles.icon, { color: isRouteActive('home') ? COLORS.primary : '#8E8E93' }]} />
        <Text style={isRouteActive('home') ? styles.labelActive : styles.label}>Wallet</Text>
      </TouchableOpacity>

      {/* --- NÚT 2: GROUP --- */}
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('group')}
        activeOpacity={0.7}
      >
        {isRouteActive('group') ? <View style={styles.activeDot} /> : <View style={styles.dummyDot} />}
        <Feather name="users" style={[styles.icon, { color: isRouteActive('group') ? COLORS.primary : '#8E8E93' }]} />
        <Text style={isRouteActive('group') ? styles.labelActive : styles.label}>Group</Text>
      </TouchableOpacity>

      {/* --- NÚT 3: VOICE (Nút giữa nổi lên) --- */}
      {/* --- NÚT 3: VOICE / CREATE (Nút giữa) --- */}
      <TouchableOpacity
        style={styles.centerWrap}
        activeOpacity={0.9}

        // 1. Tap → tạo transaction
        onPress={() => router.push('/transaction/create')}

        // 2. Long press → mở voice modal
        onLongPress={() => {
          // Nếu muốn rung:
          // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/modal/voice-input');
        }}

        delayLongPress={1000}
      >
        <View style={styles.centerButton}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.centerLabel}>New Trans</Text>
      </TouchableOpacity>


      {/* --- NÚT 4: REPORT --- */}
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('report')}
        activeOpacity={0.7}
      >
        {isRouteActive('report') ? <View style={styles.activeDot} /> : <View style={styles.dummyDot} />}
        <Feather name="bar-chart-2" style={[styles.icon, { color: isRouteActive('report') ? COLORS.primary : '#8E8E93' }]} />
        <Text style={isRouteActive('report') ? styles.labelActive : styles.label}>Report</Text>
      </TouchableOpacity>

      {/* --- NÚT 5: EXPLORE --- */}
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('explore')}
        activeOpacity={0.7}
      >
        {isRouteActive('explore') ? <View style={styles.activeDot} /> : <View style={styles.dummyDot} />}
        <Feather name="compass" style={[styles.icon, { color: isRouteActive('explore') ? COLORS.primary : '#8E8E93' }]} />
        <Text style={isRouteActive('explore') ? styles.labelActive : styles.label}>Explore</Text>
      </TouchableOpacity>

    </View>
  );
};

// 2. Main Layout Config
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="group" />
      <Tabs.Screen name="report" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="voice" /> 
      <Tabs.Screen name="wallet" options={{ href: null }} />
      <Tabs.Screen name="approval" options={{ href: null }} />
      <Tabs.Screen name="goal" options={{ href: null }} />
    </Tabs>
  );
}

// 3. Styles
const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  
  // Tab thường
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: '#8E8E93',
  },
  labelActive: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  
  // Active Indicator
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginBottom: 4,
  },
  dummyDot: { // View rỗng để giữ chỗ, tránh icon bị nhảy lên xuống
    height: 6,
    marginBottom: 4,
  },

  // Nút giữa (Floating)
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    top: -15, 
    flex: 1,
    zIndex: 10,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  centerLabel: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },

  // Divider Lines
  navDividerLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '35%',
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
  },
  navDividerRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '35%',
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
  },
});