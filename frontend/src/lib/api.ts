// lib/api.ts
export async function fetchTokenBalance(wallet: string) {
  if (!wallet) return 0;
  const res = await fetch(`http://localhost:4000/api/balance/${wallet}`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.success ? data.balance : 0;
}