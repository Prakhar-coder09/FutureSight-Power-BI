export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'INR') {
    const crores = amount / 10000;
    return `₹${crores.toFixed(2)} Cr`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPercentage(val: number): string {
  return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
}
