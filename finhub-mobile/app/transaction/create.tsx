import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

export default function ManualInputScreen() {
  const [activeTab, setActiveTab] = useState<'moneyOut' | 'moneyIn'>('moneyOut');
  const [amount, setAmount] = useState('75.000');
  const [note, setNote] = useState('Eating');
  const [selectedCategory, setSelectedCategory] = useState('cash');

  // Logic tính toán Progress Bar
  const totalBudget = 500000;
  const rawAmount = parseFloat(amount.replace(/\./g, '')) || 0;
  const remainingAmount = totalBudget;
  const spentPercentage = Math.min((rawAmount / (rawAmount + remainingAmount)) * 100, 100);

  // Data Categories
  const categories = [
    { id: 'cash', label: 'Cash', icon: '💰' },
    { id: 'vehicle', label: 'Vehicle', icon: '🚗' },
    { id: 'date', label: '03/12', icon: '📅' },
    { id: 'food', label: 'Food', icon: '🍔' },
    { id: 'drink', label: 'Drink', icon: '🥤' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  ];

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue) {
      const formatted = parseInt(numericValue).toLocaleString('vi-VN').replace(/,/g, '.');
      setAmount(formatted);
    } else {
      setAmount('');
    }
  };

  const handleSave = () => {
    if (!amount || amount === '0') {
      alert('Please enter an amount');
      return;
    }
    console.log({ type: activeTab, amount, category: selectedCategory, note });
    Keyboard.dismiss();
    router.back();
  };

  const activeColor = activeTab === 'moneyOut' ? '#EF4444' : '#10B981';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header Area */}
        <View style={styles.headerArea}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
                <TouchableOpacity
                onPress={() => setActiveTab('moneyOut')}
                style={[styles.toggleButton, activeTab === 'moneyOut' && styles.toggleButtonActive]}
                >
                <Feather name="arrow-up-right" size={16} color={activeTab === 'moneyOut' ? COLORS.white : COLORS.gray600} />
                <Text style={[styles.toggleText, activeTab === 'moneyOut' && styles.toggleTextActive]}>Money out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                onPress={() => setActiveTab('moneyIn')}
                style={[styles.toggleButton, activeTab === 'moneyIn' && styles.toggleButtonActive]}
                >
                <Feather name="arrow-down-left" size={16} color={activeTab === 'moneyIn' ? COLORS.white : COLORS.gray600} />
                <Text style={[styles.toggleText, activeTab === 'moneyIn' && styles.toggleTextActive]}>Money in</Text>
                </TouchableOpacity>
            </View>
        </View>

        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                
                {/* 1. CENTER INPUT AREA */}
                <View style={styles.centerContent}>
                    <Text style={{ fontSize: 60, marginBottom: 16 }}>🦊</Text>
                    
                    {/* Amount Input */}
                    <View style={styles.amountInputWrapper}>
                        <Text style={[styles.amountPrefix, { color: activeColor }]}>
                            {activeTab === 'moneyOut' ? '-' : '+'}
                        </Text>
                        <TextInput 
                            value={amount}
                            onChangeText={handleAmountChange}
                            keyboardType="numeric"
                            style={[styles.amountInput, { color: activeColor }]}
                            placeholder="0"
                            placeholderTextColor="#E5E7EB"
                        />
                        <Text style={[styles.amountSuffix, { color: activeColor }]}>VND</Text>
                    </View>
                    
                    {/* Note Input */}
                    <View style={styles.noteInputContainer}>
                        <TextInput
                            value={note}
                            onChangeText={setNote}
                            placeholder="Add note"
                            placeholderTextColor="#9CA3AF"
                            style={styles.noteInput}
                        />
                        <Feather name="edit-2" size={14} color="#9CA3AF" style={{ marginLeft: 8 }} />
                    </View>

                    {/* --- 🆕 VỊ TRÍ MỚI CỦA NÚT SAVE --- */}
                    <TouchableOpacity 
                        style={[styles.saveButton, { backgroundColor: activeColor }]}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveButtonText}>Confirm Transaction</Text>
                        <Feather name="check" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                </View>

                {/* 2. BOTTOM SHEET (Progress Bar & Categories) */}
                <View style={styles.bottomSheet}>
                    
                    {/* 🆕 PROGRESS BAR: To hơn & Vuông góc */}
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground} />
                        <View style={[styles.progressBarFill, { width: `${spentPercentage}%` }]} />
                        
                        <View style={styles.progressTextContainer}>
                            <View>
                                <Text style={styles.progressLabel}>Spent</Text>
                                <Text style={styles.progressValue}>{amount || '0'} VND</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.progressLabel}>Remaining</Text>
                                <Text style={styles.progressValue}>{remainingAmount.toLocaleString('vi-VN')} VND</Text>
                            </View>
                        </View>
                    </View>

                    {/* Categories List */}
                    <View style={styles.categoriesWrapper}>
                        <Text style={styles.sectionTitle}>Category</Text>
                        <View style={styles.categoriesContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                key={cat.id}
                                onPress={() => {
                                    Keyboard.dismiss(); 
                                    setSelectedCategory(cat.id);
                                }}
                                style={[styles.categoryButton, selectedCategory === cat.id && styles.categoryButtonActive]}
                                >
                                <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
                                <Text style={styles.categoryButtonText}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    
                    {/* Spacer bottom */}
                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  headerArea: {
    alignItems: 'center',
    paddingTop: 50,
    // paddingBottom: 42,
    // position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 10,
    top: 52,
    zIndex: 10,
    padding: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    padding: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  
  // CENTER AREA
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30, // Thêm padding vertical
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'center',
    padding: 0,
  },
  amountPrefix: {
    fontSize: 48,
    fontWeight: 'bold',
    marginRight: 4,
  },
  amountSuffix: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    marginTop: 18,
  },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
    minWidth: 120,
    justifyContent: 'center',
    marginBottom: 24, // Tăng khoảng cách với nút Save
  },
  noteInput: {
    fontSize: 18,
    color: '#4B5563', 
    fontWeight: '500',
    textAlign: 'center',
  },

  // 🆕 STYLE NÚT SAVE MỚI
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30, 
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // BOTTOM SHEET
  bottomSheet: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    // paddingBottom: 20,
    flex: 1, 
  },
  
  progressBarContainer: {
    height: 60, 
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#4ADE80',
    marginHorizontal: 0,
  },
  progressBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4ADE80',
    opacity: 0.5,
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#16A34A',
  },
  progressTextContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  progressLabel: {
    fontSize: 12, 
    color: COLORS.white,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  
  categoriesWrapper: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#E3F6FF',
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
  },
});