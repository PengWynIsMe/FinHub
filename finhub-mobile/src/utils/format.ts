export const formatCurrencyVND = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')}VNĐ`;
};