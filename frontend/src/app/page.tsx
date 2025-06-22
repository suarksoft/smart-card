"use client"

import { useState, useEffect } from "react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { ArrowDown, ArrowUp, Droplet, Users, Trophy, Target, Wallet } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Navbar from "@/components/navbar"
import WaterCardForm from "@/components/water-card-form"
import WaterUsagePanel from "@/components/water-usage-panel"
import WaterSavingsPanel from "@/components/water-savings-panel"
import TokenPanel from "@/components/token-panel"
import CommunityFundPanel from "@/components/community-fund-panel"
import TransferTokensPanel from "@/components/transfer-tokens-panel"
import WaterUsageHistory from "@/components/water-usage-history"
import { useWallet } from "@/lib/wallet-context"

interface WaterUsageData {
  usage: any[]
  isSaving: boolean
  savingsPercent: number
  cardId: string
  averageUsage: number
  lastWeekAverage: number
}

export default function DashboardPage() {
  const { walletAddress: wallet, isConnected } = useWallet();
  const [tokens, setTokens] = useState(0)
  const [waterCardId, setWaterCardId] = useState<string | null>(null)
  const [waterUsageData, setWaterUsageData] = useState<WaterUsageData | null>(null)
  const [communityAverage, setCommunityAverage] = useState(0)
  const [notification, setNotification] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])

  // Cüzdan değiştiğinde token bakiyesini getir
  useEffect(() => {
    if (!wallet) return
    fetchTokenBalance(wallet)

    // Cüzdan bağlandığında, bu cüzdana ait kart var mı diye kontrol et
    const checkCard = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/card-by-wallet/${wallet}`);
        const data = await res.json();
        if (data.success && data.card) {
          setWaterCardId(data.card.cardId);
          setNotification("Kayıtlı su kartınız yüklendi.");
        }
      } catch (error) {
        console.log("Mevcut kart kontrol edilirken hata oluştu.", error);
      }
    };

    checkCard();

  }, [wallet])

  // Kart kaydedildiğinde su kullanım verilerini getir
  useEffect(() => {
    if (!waterCardId) return
    fetchWaterUsageData(waterCardId)
    fetchCommunityAverage()
    fetchLeaderboard()
    fetchAchievements()
  }, [waterCardId])

  const fetchTokenBalance = async (walletAddress: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/balance/${walletAddress}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API JSON döndürmedi')
      }
      
      const data = await res.json()
      if (data.success) setTokens(data.balance)
    } catch (error) {
      console.error("Token bakiyesi çekilemedi", error)
      // Hata durumunda demo değer
      setTokens(0)
    }
  }

  const fetchWaterUsageData = async (cardId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/water-usage/${cardId}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API JSON döndürmedi')
      }
      
      const data = await res.json()
      if (data.success) setWaterUsageData(data.data)
    } catch (error) {
      console.error("Su kullanım verileri çekilemedi", error)
      // Hata durumunda demo veri
      const demoUsage = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 100) + 100
      }))
      
      setWaterUsageData({
        usage: demoUsage,
        isSaving: true,
        savingsPercent: 15,
        cardId,
        averageUsage: 150,
        lastWeekAverage: 140
      })
    }
  }

  const fetchCommunityAverage = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/community-average")
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API JSON döndürmedi')
      }
      
      const data = await res.json()
      if (data.success) setCommunityAverage(data.data.communityAverage)
    } catch (error) {
      console.error("Topluluk ortalaması çekilemedi", error)
      // Hata durumunda demo değer
      setCommunityAverage(150)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/leaderboard")
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API JSON döndürmedi')
      }
      
      const data = await res.json()
      if (data.success) setLeaderboard(data.data)
    } catch (error) {
      console.error("Liderlik tablosu çekilemedi", error)
      // Demo veri
      setLeaderboard([
        { name: "Ahmet Yılmaz", tokens: 445, savings: 1200 },
        { name: "Ayşe Demir", tokens: 515, savings: 1500 },
        { name: "Mehmet Kaya", tokens: 455, savings: 1100 }
      ])
    }
  }

  const fetchAchievements = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/achievements")
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API JSON döndürmedi')
      }
      
      const data = await res.json()
      if (data.success) setAchievements(data.data)
    } catch (error) {
      console.error("Başarılar çekilemedi", error)
      // Demo veri
      setAchievements([
        { id: "first-save", name: "İlk Tasarruf", unlocked: true },
        { id: "water-warrior", name: "Su Savaşçısı", unlocked: false }
      ])
    }
  }

  const registerWaterCard = async (cardId: string) => {
    if (!wallet) {
      setNotification("Lütfen önce cüzdanınızı bağlayın")
      return
    }
    
    try {
      const res = await fetch("http://localhost:4000/api/register-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, wallet }),
      })
      
      const data = await res.json()
      if (data.success) {
        setWaterCardId(cardId)
        setNotification("Su kartınız başarıyla kaydedildi")
      } else {
        setNotification(`Hata: ${data.error}`)
      }
    } catch (error) {
      console.error("Su kartı kaydedilemedi", error)
      setNotification("Bir hata oluştu, lütfen tekrar deneyin")
    }
  }

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 5000)
  }

  // Grafik verilerini hazırla
  const prepareChartData = () => {
    if (!waterUsageData?.usage) return []
    
    return waterUsageData.usage.slice(-7).map((item, index) => ({
      gun: `Gün ${index + 1}`,
      kullanim: item.amount,
      ortalama: communityAverage
    }))
  }

  const prepareMonthlyData = () => {
    if (!waterUsageData?.usage) return []
    
    const monthlyData = []
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran']
    
    for (let i = 0; i < 6; i++) {
      monthlyData.push({
        ay: months[i],
        kullanim: Math.floor(Math.random() * 2000) + 1000,
        ortalama: Math.floor(Math.random() * 2500) + 1500
      })
    }
    
    return monthlyData
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Su Hakkı Tokenizasyon Sistemi
        </h1>
        
        {notification && (
          <Alert className="mb-4">
            <AlertDescription>{notification}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sol sütun - Ana içerik */}
          <div className="lg:col-span-8 space-y-6">
            {/* Su Kartı Kayıt Formu */}
            {!waterCardId && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <WaterCardForm onSubmit={registerWaterCard} />
              </div>
            )}

            {/* Su Kullanım Paneli */}
            {waterUsageData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <WaterUsagePanel usageData={waterUsageData} communityAverage={communityAverage} />
              </div>
            )}

            {/* Su Tasarruf Paneli */}
            {waterUsageData && waterUsageData.isSaving && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <WaterSavingsPanel
                  savingsPercent={waterUsageData.savingsPercent}
                  wallet={wallet}
                  onRewardClaimed={() => fetchTokenBalance(wallet!)}
                  onNotification={showNotification}
                />
              </div>
            )}

            {/* Su Kullanım Geçmişi */}
            {waterUsageData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <WaterUsageHistory usageData={waterUsageData.usage} />
              </div>
            )}

            {/* İstatistik Kartları */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-aqua-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1">
                    <Droplet className="h-3 w-3 sm:h-4 sm:w-4 text-aqua-500" />
                    <span className="hidden sm:inline">Bu Hafta</span>
                    <span className="sm:hidden">Hafta</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold">
                    {waterUsageData?.lastWeekAverage || 0}L
                  </div>
                  <p className="text-xs text-green-600 flex items-center">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    %{waterUsageData?.savingsPercent || 0} tasarruf
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-teal-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-teal-500" />
                    <span className="hidden sm:inline">Ortalama</span>
                    <span className="sm:hidden">Ort.</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{communityAverage}L</div>
                  <p className="text-xs text-muted-foreground">Haftalık ort.</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1">
                    <Droplet className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span className="hidden sm:inline">Token</span>
                    <span className="sm:hidden">WTR</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{tokens}</div>
                  <p className="text-xs text-green-600 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +{Math.floor(tokens * 0.1)} bu hafta
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                    <span className="hidden sm:inline">Hedef</span>
                    <span className="sm:hidden">Hedef</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm sm:text-lg font-bold">
                    {tokens}/500
                  </div>
                  <Progress value={(tokens / 500) * 100} className="mt-2 h-1 sm:h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Başarı Bildirimi */}
            {waterUsageData?.isSaving && (
              <Alert className="border-green-200 bg-green-50">
                <Trophy className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 text-sm sm:text-base">Tebrikler! 🎉</AlertTitle>
                <AlertDescription className="text-green-700 text-sm">
                  Bu hafta ortalamanın %{waterUsageData.savingsPercent} altında su kullandın ve {Math.floor(waterUsageData.savingsPercent / 2)} Su Hakkı Token kazandın!
                </AlertDescription>
              </Alert>
            )}

            {/* Grafikler */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Günlük Su Kullanımı</CardTitle>
                  <CardDescription className="text-sm">Bu hafta (Litre)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareChartData()} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="gun" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Legend fontSize={12} />
                        <Bar dataKey="kullanim" fill="#0ea5e9" radius={2} name="Senin Kullanımın" />
                        <Bar dataKey="ortalama" fill="#14b8a6" radius={2} name="Ortalama" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Aylık Trend</CardTitle>
                  <CardDescription className="text-sm">6 aylık kullanım (Litre)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareMonthlyData()} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ay" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Legend fontSize={12} />
                        <Line type="monotone" dataKey="kullanim" stroke="#0ea5e9" strokeWidth={3} name="Senin Kullanımın" />
                        <Line
                          type="monotone"
                          dataKey="ortalama"
                          stroke="#14b8a6"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Ortalama"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alt Bölüm */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Liderlik Tablosu */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Toplumsal Etki Panosu</CardTitle>
                  <CardDescription className="text-sm">En çok su tasarrufu yapanlar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <span className="text-sm text-green-600">{user.tokens} SHT</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Başarılar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Başarılarım</CardTitle>
                  <CardDescription className="text-sm">Su tasarrufu rozetlerin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className={`w-8 h-8 rounded-full ${achievement.unlocked ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center`}>
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-xs text-gray-500">
                          {achievement.unlocked ? 'Kazanıldı' : 'Kilitli'}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Topluluk Etkisi */}
            <Card className="bg-gradient-to-r from-aqua-500 to-teal-500 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-2xl font-bold mb-2">Toplam Toplumsal Etki</h3>
                    <p className="text-aqua-100 mb-4 text-sm">Platform genelinde tasarruf edilen su</p>
                    <div className="text-2xl sm:text-4xl font-bold">2.4M Litre</div>
                    <p className="text-aqua-200 text-sm">Bu ay +340K litre tasarruf</p>
                  </div>
                  <div className="text-4xl sm:text-6xl opacity-20">💧</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ sütun - Token ve İşlemler */}
          <div className="lg:col-span-4 space-y-6">
            {/* Cüzdan bilgisi */}
            {wallet ? (
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Bağlı Cüzdan</div>
                  <div className="font-medium">
                    {wallet.slice(0, 8)}...{wallet.slice(-6)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-700 text-sm">
                  Su kartınızı kaydetmek ve token yönetimi için cüzdanınızı bağlayın.
                </p>
              </div>
            )}

            {/* Token paneli */}
            <TokenPanel tokens={tokens} tokenName="Su Hakkı Token" />

            {/* Token Transfer Paneli */}
            {wallet && (
              <TransferTokensPanel
                wallet={wallet}
                tokenBalance={tokens}
                onTransfer={() => fetchTokenBalance(wallet)}
                onNotification={showNotification}
              />
            )}

            {/* Topluluk Fonu Paneli */}
            {wallet && (
              <CommunityFundPanel
                wallet={wallet}
                tokenBalance={tokens}
                onDonate={() => fetchTokenBalance(wallet)}
                onNotification={showNotification}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex items-center gap-4 md:hidden">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-aqua-800">AquaSave</h1>
        </div>
        <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
          <Trophy className="mr-1 h-3 w-3" />
          Lider
        </Badge>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-aqua-800">Hoş Geldin, Ahmet!</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Su tasarruf yolculuğuna devam edelim 💧</p>
        </div>
        <Badge variant="outline" className="text-green-700 border-green-300 px-3 py-2">
          <Trophy className="mr-2 h-4 w-4" />
          Tasarruf Lideri
        </Badge>
      </div>

      {/* Mobile Welcome */}
      <div className="md:hidden">
        <h2 className="text-lg font-bold text-aqua-800">Hoş Geldin, Ahmet!</h2>
        <p className="text-sm text-muted-foreground">Su tasarruf yolculuğuna devam edelim 💧</p>
      </div>
    </main>
  )
}
