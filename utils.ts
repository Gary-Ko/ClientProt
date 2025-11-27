export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  // Just simplified for demo
  return dateString.split(' ')[0];
};
