import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, InfoIcon, Users, TrendingUp, Gift } from "lucide-react"

interface CommunityFundPanelProps {
  wallet: string
  tokenBalance: number
  onDonate: () => void
  onNotification: (message: string) => void
}

interface FundStats {
  currentBalance: number
  totalDonations: number
  totalAmount: number
  uniqueDonors: number
  averageDonation: number
  recentDonations: Array<{
    wallet: string
    amount: number
    timestamp: string
    transactionId: string
  }>
}

export default function CommunityFundPanel({ 
  wallet, 
  tokenBalance, 
  onDonate,
  onNotification
}: CommunityFundPanelProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [communityFundBalance, setCommunityFundBalance] = useState(0)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [fundStats, setFundStats] = useState<FundStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  
  // Topluluk fonu bakiyesini ve istatistiklerini getir
  useEffect(() => {
    const fetchCommunityFundData = async () => {
      try {
        // Bakiye getir
        const balanceRes = await fetch("http://localhost:4000/api/community-fund-balance")
        const balanceData = await balanceRes.json()
        if (balanceData.success) {
          setCommunityFundBalance(balanceData.balance)
        }
        
        // İstatistikleri getir
        const statsRes = await fetch("http://localhost:4000/api/community-fund-stats")
        const statsData = await statsRes.json()
        if (statsData.success) {
          setFundStats(statsData.stats)
        }
      } catch (error) {
        console.error("Topluluk fonu verileri çekilemedi:", error)
      } finally {
        setLoadingBalance(false)
        setLoadingStats(false)
      }
    }
    
    fetchCommunityFundData()
  }, [])
  
  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!wallet || !amount) return
    
    const donationAmount = parseInt(amount)
    if (isNaN(donationAmount) || donationAmount <= 0) {
      onNotification("Lütfen geçerli bir miktar girin")
      return
    }
    
    if (donationAmount > tokenBalance) {
      onNotification("Yetersiz token bakiyesi")
      return
    }
    
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:4000/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          wallet,
          amount: donationAmount 
        }),
      })
      
      const data = await res.json()
      if (data.success) {
        onNotification(`${donationAmount} token başarıyla topluluk fonuna bağışlandı`)
        setAmount("")
        setCommunityFundBalance(data.communityFundBalance)
        
        // İstatistikleri yenile
        const statsRes = await fetch("http://localhost:4000/api/community-fund-stats")
        const statsData = await statsRes.json()
        if (statsData.success) {
          setFundStats(statsData.stats)
        }
        
        onDonate()
      } else {
        onNotification(`Hata: ${data.error}`)
      }
    } catch (error) {
      console.error("Bağış başarısız", error)
      onNotification("Bir hata oluştu, lütfen tekrar deneyin")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
          <Heart className="h-5 w-5 text-red-500" />
          Topluluk Su Fonu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Topluluk Fonu Bakiyesi */}
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Topluluk Fonu Bakiyesi</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {loadingBalance ? "Yükleniyor..." : `${communityFundBalance} SHT`}
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Bu fon, suya erişim sıkıntısı çeken hanelere yardım için kullanılır
          </p>
        </div>
        
        {/* İstatistikler */}
        {fundStats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-gray-700">Toplam Bağış</span>
              </div>
              <div className="text-lg font-bold text-green-700">{fundStats.totalAmount} SHT</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-1 mb-1">
                <Gift className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-medium text-gray-700">Bağışçı Sayısı</span>
              </div>
              <div className="text-lg font-bold text-purple-700">{fundStats.uniqueDonors}</div>
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p>
            Su tokenlerinizi ihtiyaç sahiplerine bağışlayarak topluma katkıda bulunabilirsiniz.
          </p>
          <div className="flex items-start gap-2 mt-2 bg-white p-2 rounded-md">
            <InfoIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs">
              Bağışlanan her token, suya erişim sıkıntısı çeken hanelere doğrudan yardım olarak ulaştırılacaktır.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleDonate} className="space-y-3">
          <div>
            <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Bağış Miktarı
            </label>
            <Input
              id="donationAmount"
              type="number"
              placeholder="Bağışlanacak token miktarı"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
              min="1"
              max={tokenBalance.toString()}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mevcut bakiye: {tokenBalance} token
            </p>
          </div>
          
          <Button 
            type="submit" 
            variant="outline"
            disabled={isLoading || !wallet || !amount || parseInt(amount) > tokenBalance} 
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {isLoading ? "İşleniyor..." : "Bağış Yap"}
          </Button>
        </form>
        
        {/* Son Bağışlar */}
        {fundStats && Array.isArray(fundStats.recentDonations) && fundStats.recentDonations.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Son Bağışlar</h4>
            <div className="space-y-2">
              {fundStats.recentDonations.map((donation, index) => (
                <div key={donation.transactionId} className="flex justify-between items-center bg-white p-2 rounded-md text-xs">
                  <span className="text-gray-600">
                    {donation.wallet.slice(0, 6)}...{donation.wallet.slice(-4)}
                  </span>
                  <span className="font-medium text-green-600">+{donation.amount} SHT</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}