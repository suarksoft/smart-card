"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { connectWallet as connectToFreighter } from './wallet'; // Adını değiştirdik

interface WalletContextType {
  walletAddress: string | null
  isConnected: boolean
  balance: number
  loading: boolean
  error: string | null;
  connectWallet: () => Promise<void> // Artık parametre almayacak
  disconnectWallet: () => void
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true) // Sayfa ilk yüklendiğinde kontrol için true
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async (address: string) => {
    try {
      console.log(`Bakiye çekiliyor: ${address}`);
      const res = await fetch(`http://localhost:4000/api/balance/${address}`);
      
      if (!res.ok) {
        console.error(`API hatası: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.error('Response body:', text);
        return;
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API JSON döndürmedi:', contentType);
        const text = await res.text();
        console.error('Response body:', text);
        return;
      }
      
      const data = await res.json();
      console.log('API response:', data);
      
      if (data.success) {
        setBalance(data.balance);
      } else {
        console.error('API başarısız:', data.error);
      }
    } catch (error) {
      console.error("Bakiye çekilemedi:", error);
    }
  }

  useEffect(() => {
    const checkStoredWallet = () => {
      try {
        const storedAddress = localStorage.getItem('walletAddress');
        if (storedAddress) {
          setWalletAddress(storedAddress);
          setIsConnected(true);
          // Kayıtlı cüzdan varsa bakiyesini de çek
          fetchBalance(storedAddress);
        }
      } catch (e) {
        console.error("Local storage'a erişilemedi", e);
      } finally {
        setLoading(false);
      }
    };
    checkStoredWallet();
  }, []);

  const connectWallet = async () => {
    setLoading(true)
    setError(null);
    try {
      const address = await connectToFreighter(); // Gerçek cüzdan bağlantısı
      setWalletAddress(address)
      setIsConnected(true)
      localStorage.setItem('walletAddress', address)
      
      // Cüzdan bağlandıktan sonra bakiyesini çek
      await fetchBalance(address)
    } catch (err) {
      console.error("Cüzdan bağlantı hatası:", err)
      const message = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
      setError(message);
      // İsteğe bağlı olarak burada bir toast bildirimi de gösterebilirsiniz.
      throw err; // Hatayı UI katmanının yakalaması için tekrar fırlat
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    setIsConnected(false)
    setBalance(0)
    localStorage.removeItem('walletAddress')
  }

  const refreshBalance = async () => {
    if (walletAddress) {
      await fetchBalance(walletAddress)
    }
  }

  const value = {
    walletAddress,
    isConnected,
    balance,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
} 