"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Droplet, Users, Target, TrendingUp, Lock } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useWallet } from "@/lib/wallet-context"
import { toast as sonnerToast } from "sonner"
import { Label } from "@/components/ui/label"

// Demo için sabit cüzdan adresi
const DEMO_WALLET = "GAELIPRPRLJFET6FWVU4KN3R32Z7WH3KCHPTVIJOIYLYIWFUWT2NXJFE"

// Tutarlı sayı formatlaması için yardımcı fonksiyon
const formatNumber = (num: number | undefined | null) => {
  if (num === undefined || num === null) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const causes = [
  {
    id: "1",
    isim: "Su Kuyusu Projesi",
    aciklama: "Afrika'da temiz su erişimi sağlamak",
    resim: "https://via.placeholder.com/80x80/0ea5e9/ffffff?text=💧",
    hedef: 5000,
    toplanan: 3200,
    katilimci: 45,
    kalanGun: 12
  },
  {
    id: "2",
    isim: "Tarım Sulama Sistemi",
    aciklama: "Kurak bölgelerde modern sulama",
    resim: "https://via.placeholder.com/80x80/10b981/ffffff?text=🌱",
    hedef: 3000,
    toplanan: 1800,
    katilimci: 32,
    kalanGun: 8
  },
  {
    id: "3",
    isim: "Su Arıtma Tesisi",
    aciklama: "Endüstriyel su arıtma projesi",
    resim: "https://via.placeholder.com/80x80/6366f1/ffffff?text=🏭",
    hedef: 8000,
    toplanan: 5200,
    katilimci: 78,
    kalanGun: 25
  }
]

const recentDonations = [
  { isim: "Ahmet Y.", miktar: 150, proje: "Temiz Su Fonu", tarih: "2 saat önce" },
  { isim: "Zeynep K.", miktar: 200, proje: "Okyanus Temizlik", tarih: "5 saat önce" },
  { isim: "Mehmet A.", miktar: 100, proje: "Sokak Hayvanları", tarih: "1 gün önce" },
  { isim: "Ayşe D.", miktar: 75, proje: "Yağmur Ormanı", tarih: "2 gün önce" },
]

export default function BagisPage() {
  const { toast } = useToast()
  const { walletAddress, isConnected, balance, loading, connectWallet, refreshBalance } = useWallet()
  const [donationAmounts, setDonationAmounts] = useState<{ [key: string]: string }>({})
  const [userTotalDonations, setUserTotalDonations] = useState(0)
  const [walletInput, setWalletInput] = useState("")
  const [connectError, setConnectError] = useState("")

  const handleConnectWallet = async () => {
    try {
      setConnectError("")
      await connectWallet()
      setWalletInput("")
      toast({
        title: "Cüzdan Bağlandı! 🎉",
        description: "Cüzdanınız başarıyla bağlandı.",
      })
    } catch (error) {
      setConnectError(error instanceof Error ? error.message : "Cüzdan bağlantı hatası")
    }
  }

  const handleDonation = async (causeId: string, causeName: string) => {
    const amount = parseInt(donationAmounts[causeId])
    
    if (!amount || amount <= 0) {
      toast({
        title: "Geçersiz Miktar",
        description: "Lütfen geçerli bir bağış miktarı girin.",
        variant: "destructive",
      })
      return
    }

    if (amount > balance) {
      toast({
        title: "Yetersiz Bakiye",
        description: "Cüzdanınızda yeterli token bulunmuyor.",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("http://localhost:4000/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          walletAddress: walletAddress, 
          amount: amount,
          projectId: causeId
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        // Test toast'u ekleyelim
        console.log("Toast tetikleniyor...")
        
        // Normal toast
        toast({
          title: "Bağış Başarılı! 🎉",
          description: `${amount} SHT ${causeName} projesine bağışlandı. Teşekkürler!`,
        })
        
        // Sonner toast (alternatif)
        sonnerToast.success("Bağış Başarılı! 🎉", {
          description: `${amount} SHT ${causeName} projesine bağışlandı. Teşekkürler!`,
        })
        
        // Bakiyeyi güncelle
        await refreshBalance()
        setUserTotalDonations(prev => prev + amount)
        setDonationAmounts(prev => ({ ...prev, [causeId]: "" }))
        
      } else {
        toast({
          title: "Bağış Hatası",
          description: data.error || "Bağış işlemi başarısız oldu.",
          variant: "destructive"
        })
        
        sonnerToast.error("Bağış Hatası", {
          description: data.error || "Bağış işlemi başarısız oldu.",
        })
      }
    } catch (error) {
      console.error("Bağış hatası:", error)
      toast({
        title: "Bağlantı Hatası",
        description: "Sunucuya bağlanırken hata oluştu.",
        variant: "destructive"
      })
    }
  }

  const handleAmountChange = (causeId: string, value: string) => {
    setDonationAmounts((prev) => ({ ...prev, [causeId]: value }))
  }

  // Cüzdan bağlı değilse bağlantı ekranını göster
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Cüzdan Bağlantısı Gerekli</CardTitle>
            <CardDescription className="text-gray-600">
              Bağış yapmak için cüzdan adresinizi girin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-address" className="text-sm font-medium">
                Stellar Cüzdan Adresi
              </Label>
              <Input
                id="wallet-address"
                placeholder="G ile başlayan 56 karakterlik adres"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                className="text-sm"
              />
              {connectError && (
                <p className="text-sm text-red-600">{connectError}</p>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Demo Cüzdan</h4>
              <p className="text-sm text-blue-700">
                Test için bu adresi kullanabilirsiniz: <br />
                <code className="text-xs bg-blue-100 px-2 py-1 rounded">
                  GAELIPRPRLJFET6FWVU4KN3R32Z7WH3KCHPTVIJOIYLYIWFUWT2NXJFE
                </code>
              </p>
            </div>
            
            <Button 
              onClick={handleConnectWallet} 
              disabled={loading || !walletInput.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Bağlanıyor...
                </>
              ) : (
                <>
                  <Droplet className="mr-2 h-4 w-4" />
                  Cüzdanı Bağla
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="flex items-center gap-4 md:hidden">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-aqua-800">Bağış Yap</h1>
        </div>
        <div className="text-right">
          {loading ? (
            <div className="text-sm font-bold text-teal-600">Yükleniyor...</div>
          ) : (
            <div className="text-sm font-bold text-teal-600">{formatNumber(balance)} SHT</div>
          )}
          <p className="text-xs text-muted-foreground">Bakiye</p>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-aqua-800">Tokenlarını Bağışla</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Kazandığın Su Hakkı Token'ları sosyal projelere bağışlayarak fark yarat! 💙
          </p>
        </div>
        <div className="text-center">
          {loading ? (
            <div className="text-2xl font-bold text-teal-600">Yükleniyor...</div>
          ) : (
            <div className="text-2xl font-bold text-teal-600">{formatNumber(balance)} SHT</div>
          )}
          <p className="text-sm text-muted-foreground">Mevcut Bakiyen</p>
        </div>
      </div>

      {/* Mobile Description */}
      <div className="md:hidden">
        <p className="text-sm text-muted-foreground">
          Kazandığın Su Hakkı Token'ları sosyal projelere bağışlayarak fark yarat! 💙
        </p>
      </div>

      {/* Impact Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span className="hidden sm:inline">Toplam Bağış</span>
              <span className="sm:hidden">Bağış</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">47K SHT</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Bu ay +5.2K
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <span className="hidden sm:inline">Projeler</span>
              <span className="sm:hidden">Proje</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Aktif proje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
              <span className="hidden sm:inline">Bağışçı</span>
              <span className="sm:hidden">Kişi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">1.847</div>
            <p className="text-xs text-muted-foreground">Katılımcı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1">
              <Droplet className="h-3 w-3 sm:h-4 sm:w-4 text-teal-500" />
              <span className="hidden sm:inline">Senin Bağışın</span>
              <span className="sm:hidden">Bağışın</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatNumber(userTotalDonations)} SHT</div>
            <p className="text-xs text-muted-foreground">Toplam bağış</p>
          </CardContent>
        </Card>
      </div>

      {/* Donation Projects */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {causes.map((cause) => {
          const progress = (cause.toplanan / cause.hedef) * 100
          return (
            <Card key={cause.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start gap-3 sm:gap-4">
                  <img
                    src={cause.resim || "/placeholder.svg"}
                    alt={cause.isim}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-base sm:text-lg leading-tight">{cause.isim}</CardTitle>
                      <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                        {cause.kalanGun} gün kaldı
                      </Badge>
                    </div>
                    <CardDescription className="text-xs sm:text-sm">{cause.aciklama}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>İlerleme</span>
                    <span>
                      {formatNumber(cause.toplanan)} / {formatNumber(cause.hedef)} SHT
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>%{Math.round(progress)} tamamlandı</span>
                    <span>{cause.katilimci} kişi katıldı</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Miktar"
                      className="pl-8 sm:pl-9 text-sm"
                      value={donationAmounts[cause.id] || ""}
                      onChange={(e) => handleAmountChange(cause.id, e.target.value)}
                      min="1"
                      max={balance}
                    />
                  </div>
                  <Button
                    onClick={() => handleDonation(cause.id, cause.isim)}
                    className="bg-teal-500 hover:bg-teal-600 text-white text-sm px-3 sm:px-4"
                    disabled={loading || !donationAmounts[cause.id] || parseInt(donationAmounts[cause.id]) <= 0 || parseInt(donationAmounts[cause.id]) > balance}
                  >
                    <Heart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Bağışla</span>
                    <span className="sm:hidden">Bağış</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Son Bağışlar</CardTitle>
          <CardDescription className="text-sm">Toplumun son bağış aktiviteleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {recentDonations.map((donation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-400 to-aqua-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {donation.isim.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">{donation.isim}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{donation.proje}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-green-600 text-sm sm:text-base">{donation.miktar} SHT</p>
                  <p className="text-xs text-muted-foreground">{donation.tarih}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
