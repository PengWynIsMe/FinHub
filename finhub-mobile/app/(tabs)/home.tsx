
import React from 'react';
import { View, Text, ScrollView, StatusBar, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { BudgetSummaryCard } from '@/components/wallet/BudgetSummaryCard';
import { BudgetCard } from '@/components/wallet/BudgetCard';

const MOCK_USER = {
  name: 'Push Puttichai',
  avatar: 'https://i.pravatar.cc/100',
  unallocatedMoney: 10000000,
  monthlySpending: 100000,
};

const MOCK_BUDGETS = {
  mandatory: [
    { id: '1', name: 'Travel', icon: '✈️', allocated: 0, spent: 0, color: COLORS.budgetTravel },
    { id: '2', name: 'Pet', icon: '🐕', allocated: 0, spent: 0, color: COLORS.budgetPet },
  ],
  nonRecurring: [
    { id: '3', name: 'Car maintenance', icon: '🚗', allocated: 0, spent: 0, color: COLORS.budgetCar },
  ],
};

export default function HomeScreen() {
  const handleAllocate = () => {
    console.log("Navigating to Allocate Screen...");
    // router.push('/wallet/allocate');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          <View style={styles.userInfo}>
            <Image source={{ uri: MOCK_USER.avatar }} style={styles.avatar} />
            <Text style={styles.greeting}>Hi, {MOCK_USER.name}</Text>
          </View>
          <View style={styles.headerActions}>
             <TouchableOpacity style={styles.headerButton}><Text>🔔</Text></TouchableOpacity>
             <TouchableOpacity style={styles.headerButton}><Text>⚙️</Text></TouchableOpacity>
          </View>
        </View>

        {/* Component đã tách: Budget Summary */}
        <BudgetSummaryCard 
            unallocatedMoney={MOCK_USER.unallocatedMoney}
            monthlySpending={MOCK_USER.monthlySpending}
            onAllocatePress={handleAllocate}
        />
      </View>

      {/* Body Section */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Mandatory fee</Text>
        {MOCK_BUDGETS.mandatory.map((item) => (
          <BudgetCard key={item.id} item={item} />
        ))}

        <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Non-recurring fee</Text>
        {MOCK_BUDGETS.nonRecurring.map((item) => (
          <BudgetCard key={item.id} item={item} />
        ))}
        
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: SPACING.md },
  greeting: { color: COLORS.white, fontSize: FONT_SIZE.lg, fontWeight: '600' },
  headerActions: { flexDirection: 'row' },
  headerButton: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  scrollView: { flex: 1, paddingHorizontal: SPACING.xl },
  scrollContent: { paddingTop: SPACING.lg },
  sectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  sectionTitleSpacing: { marginTop: SPACING.sm },
});