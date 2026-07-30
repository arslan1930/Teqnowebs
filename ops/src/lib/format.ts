export function money(amount: number, currency = "PKR") {
  return `${currency} ${amount.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}
