export const formatCurrencyVND = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')}VNĐ`;
};

export const getBudgetProgressColor = (spent: number, allocated: number): string => {
  if (allocated <= 0) return '#EF4444'; 

  const percent = (spent / allocated) * 100;

  if (percent >= 80) return '#EF4444';
  if (percent >= 50) return '#F59E0B'; 
  return '#10B981';                  
};