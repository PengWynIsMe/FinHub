import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Import các hằng số giao diện và hàm format tiền tệ
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { formatCurrencyVND } from '@/utils/format';

// 1. Định nghĩa Interface: Quy định dữ liệu đầu vào bắt buộc
interface BudgetSummaryCardProps {
  unallocatedMoney: number; // Số tiền chưa phân bổ
  monthlySpending: number;  // Số tiền đã tiêu trong tháng
  onAllocatePress: () => void; // Hàm xử lý khi bấm nút "Allocate Money"
}

// 2. Component chính
export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  unallocatedMoney,
  monthlySpending,
  onAllocatePress,
}) => {
  return (
    <View style={styles.summaryCard}>
      {/* --- Phần 1: Tiền chưa phân bổ --- */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Unallocated money</Text>
        <Feather name="alert-circle" size={16} color={COLORS.gray500} />
      </View>
      <Text style={styles.summaryAmountLarge}>
        {formatCurrencyVND(unallocatedMoney)}
      </Text>

      {/* --- Phần 2: Chi tiêu tháng này --- */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Spending this month</Text>
        <Feather name="bar-chart-2" size={16} color={COLORS.gray500} />
      </View>
      <Text style={styles.summaryAmountMedium}>
        {formatCurrencyVND(monthlySpending)}
      </Text>

      {/* --- Phần 3: Nút hành động --- */}
      <TouchableOpacity
        style={styles.allocateButton}
        activeOpacity={0.8}
        onPress={onAllocatePress} // Gọi hàm được truyền từ bên ngoài vào
      >
        <Text style={styles.allocateButtonText}>ALLOCATE MONEY →</Text>
      </TouchableOpacity>
    </View>
  );
};

// 3. Styles: Đã được tách biệt và sử dụng biến từ theme
const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    // Hiệu ứng đổ bóng (Shadow)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, // Cho Android
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    color: COLORS.gray600,
    fontSize: FONT_SIZE.md,
  },
  summaryAmountLarge: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.lg,
  },
  summaryAmountMedium: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.lg,
  },
  allocateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  allocateButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
  },
});