"use client" // Hook'lar kullanıldığı için bu gerekli

import React from 'react';
import { useWallet } from '@/lib/wallet-context';
import { Button } from './ui/button'; // Butonumuzu import edelim
import { toast } from "sonner" // Hata gösterimi için

const Navbar: React.FC = () => {
  const { 
    walletAddress, 
    isConnected, 
    loading, 
    error, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success("Cüzdan başarıyla bağlandı!")
    } catch (err: any) {
      // WalletContext içinde hata zaten yakalanıp state'e yazılıyor.
      // Orada fırlatıldığı için burada tekrar yakalayıp toast gösterebiliriz.
      toast.error(err.message || "Cüzdan bağlanamadı. Lütfen tekrar deneyin.");
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.info("Cüzdan bağlantısı kesildi.");
  };

  return (
    <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl text-blue-600 flex items-center gap-2">
          <span className="text-2xl">💧</span>
          <span className="hidden sm:inline"></span>
          <span className="sm:hidden">SHT</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {isConnected && walletAddress ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded hidden sm:block">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
              <div className="text-xs text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded sm:hidden">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Bağlantıyı Kes</span>
                <span className="sm:hidden">Çıkış</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Bağlanıyor...</span>
                  <span className="sm:hidden">...</span>
                </div>
              ) : (
                <>
                  <span className="hidden sm:inline">Freighter ile Cüzdan Bağla</span>
                  <span className="sm:hidden">Cüzdan Bağla</span>
                </>
              )}
            </Button>
          )}
        </div>
        
        {error && !loading && (
          <div className="absolute top-full left-0 right-0 bg-red-50 border border-red-200 p-2 text-center">
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar;