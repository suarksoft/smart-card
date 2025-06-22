"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SproutIcon as Seedling, Plus, Droplet, Lock, Wallet } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useWallet } from "@/lib/wallet-context"
import { toast as sonnerToast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

const formatNumber = (num: number | undefined | null) => {
  if (num === undefined || num === null) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const availableSeeds = [
  {
    id: "domates",
    isim: "Domates Tohumu",
    aciklama: "Organik domates yetiştirmek için",
    aylikToken: 25,
    fiyat: 100,
    stok: true,
    resim: "https://via.placeholder.com/100x100/4ade80/ffffff?text=🍅",
  },
  {
    id: "salatalik",
    isim: "Salatalık Tohumu",
    aciklama: "Taze salatalık için ideal",
    aylikToken: 20,
    fiyat: 50,
    stok: true,
    resim: "https://via.placeholder.com/100x100/22c55e/ffffff?text=🥒",
  },
  {
    id: "biber",
    isim: "Biber Tohumu",
    aciklama: "Renkli biberler yetiştirin",
    aylikToken: 30,
    fiyat: 75,
    stok: false,
    resim: "https://via.placeholder.com/100x100/ef4444/ffffff?text=🌶️",
  },
]

const mySeeds = [
  {
    id: "SD-12345",
    isim: "Domates Tohumu",
    kayitTarihi: "15.06.24",
    sonToken: "15.07.24",
    aylikToken: 25,
    toplamKazanc: 75,
    durum: "Aktif",
    progress: 65,
  },
]

export default function TohumPage() {
  const { toast } = useToast()
  const { walletAddress, isConnected, balance, loading, connectWallet, refreshBalance } = useWallet()
  const [seedIdToRegister, setSeedIdToRegister] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSeed, setSelectedSeed] = useState<typeof availableSeeds[0] | null>(null)
  const [shippingAddress, setShippingAddress] = useState("")
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

  const handleSeedPurchase = async () => {
    if (!selectedSeed || !shippingAddress) {
      toast({ title: "Hata", description: "Lütfen gönderim adresi girin.", variant: "destructive" })
      return
    }

    if (!walletAddress) {
      toast({ title: "Hata", description: "Lütfen önce cüzdanınızı bağlayın.", variant: "destructive" })
      return
    }

    if (balance < selectedSeed.fiyat) {
      toast({ title: "Yetersiz Bakiye", description: "Bu tohumu almak için yeterli SHT'niz yok.", variant: "destructive" })
      return
    }

    try {
      const res = await fetch("http://localhost:4000/api/buy-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          seedId: selectedSeed.id,
          price: selectedSeed.fiyat,
          address: shippingAddress,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Tohum Siparişi Alındı! 🌱",
          description: `${selectedSeed.isim} için ${selectedSeed.fiyat} SHT ödendi. Tohumunuz adresinize gönderilecek.`,
        });
        
        // Sonner toast (alternatif)
        sonnerToast.success("Tohum Siparişi Alındı! 🌱", {
          description: `${selectedSeed.isim} için ${selectedSeed.fiyat} SHT ödendi. Tohumunuz adresinize gönderilecek.`,
        });
        
        // Cüzdan context'indeki bakiyeyi yenile
        await refreshBalance();

      } else {
        toast({
          title: "Satın Alma Hatası",
          description: data.error || "Tohum satın alınırken bir hata oluştu.",
          variant: "destructive",
        });
        
        sonnerToast.error("Satın Alma Hatası", {
          description: data.error || "Tohum satın alınırken bir hata oluştu.",
        });
      }
    } catch (error) {
      toast({
        title: "Bağlantı Hatası",
        description: "Sunucuya bağlanırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
      setShippingAddress("");
      setSelectedSeed(null);
    }
  }

  const handleSeedRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!seedIdToRegister) {
      toast({ title: "Hata", description: "Lütfen bir Tohum ID girin.", variant: "destructive" })
      return
    }

    console.log("BACKEND İSTEĞİ: /api/redeem-seed", { walletAddress, seedId: seedIdToRegister })
    
    toast({
      title: "Tohum ID Kaydedildi! 🎉",
      description: `${seedIdToRegister} ID'si hesabınıza bağlandı ve ödül tokenleriniz yüklendi!`,
    })
    
    setSeedIdToRegister("")
    await refreshBalance()
  }
  
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Cüzdan Bağlantısı Gerekli</CardTitle>
            <CardDescription className="text-gray-600">
              Tohum alıp satmak için cüzdan adresinizi girin.
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
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Demo Cüzdan</h4>
              <p className="text-sm text-green-700">
                Test için bu adresi kullanabilirsiniz: <br />
                <code className="text-xs bg-green-100 px-2 py-1 rounded">
                  GAELIPRPRLJFET6FWVU4KN3R32Z7WH3KCHPTVIJOIYLYIWFUWT2NXJFE
                </code>
              </p>
            </div>
            
            <Button 
              onClick={handleConnectWallet} 
              disabled={loading || !walletInput.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
            >
              {loading ? "Bağlanıyor..." : "Cüzdanı Bağla"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-green-800">Tohum Pazarı</h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Tokenlarınla tohum al, yetiştir, daha fazla token kazan! 🌱
            </p>
          </div>
          <Card className="w-full sm:w-auto">
            <CardContent className="p-3 flex items-center gap-4">
              <Wallet className="h-6 w-6 text-green-700" />
              <div>
                <p className="text-xs text-muted-foreground">Bakiyeniz</p>
                <p className="font-bold text-lg">{formatNumber(balance)} SHT</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seed Registration Form */}
        <Card>
          <form onSubmit={handleSeedRegister}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Plus className="text-green-600 h-4 w-4 sm:h-5 sm:w-5" />
                Tohum ID'si ile Token Kazan
              </CardTitle>
              <CardDescription className="text-sm">
                Satın aldığınız tohum ID'sini girerek ödül token'larınızı kazanın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="seed-id" className="text-sm">
                  Tohum ID
                </Label>
                <Input 
                  id="seed-id" 
                  placeholder="Örn: SD-12345" 
                  className="text-sm" 
                  value={seedIdToRegister}
                  onChange={(e) => setSeedIdToRegister(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">
                <Seedling className="mr-2 h-4 w-4" />
                Token Kazan
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Seed Store */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Tohum Mağazası</CardTitle>
            <CardDescription className="text-sm">Tokenlarınızı kullanarak yeni tohumlar satın alın.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableSeeds.map((seed) => (
                <Card key={seed.id} className={`flex flex-col ${!seed.stok ? "opacity-50" : ""}`}>
                  <CardHeader className="text-center pb-3">
                    <img
                      src={seed.resim || "/placeholder.svg"}
                      alt={seed.isim}
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full mb-2"
                    />
                    <CardTitle className="text-base sm:text-lg">{seed.isim}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{seed.aciklama}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-2 flex-grow">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <Droplet className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-semibold text-sm">{seed.aylikToken} SHT/ay kazandırır</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold">
                      {`${seed.fiyat} SHT`}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full text-sm bg-teal-500 hover:bg-teal-600"
                        disabled={!seed.stok || balance < seed.fiyat}
                        onClick={() => setSelectedSeed(seed)}
                      >
                        {!seed.stok ? "Stokta Yok" : "Satın Al"}
                      </Button>
                    </DialogTrigger>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Seeds */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Kayıtlı Tohumlarım</CardTitle>
            <CardDescription className="text-sm">Aktif tohumlarınız ve kazanç durumları.</CardDescription>
          </CardHeader>
          <CardContent>
            {mySeeds.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {mySeeds.map((seed) => (
                  <Card key={seed.id} className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base sm:text-lg">{seed.isim}</CardTitle>
                        <Badge className="bg-green-100 text-green-800 text-xs">{seed.durum}</Badge>
                      </div>
                      <CardDescription className="text-xs sm:text-sm">ID: {seed.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-muted-foreground">Kayıt Tarihi</p>
                          <p className="font-semibold">{seed.kayitTarihi}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Son Token</p>
                          <p className="font-semibold">{seed.sonToken}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Büyüme İlerlemesi</span>
                          <span>{seed.progress}%</span>
                        </div>
                        <Progress value={seed.progress} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Aylık Ödül</p>
                          <p className="font-bold text-teal-600 text-sm">{seed.aylikToken} SHT</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Toplam Kazanç</p>
                          <p className="font-bold text-green-600 text-sm">{seed.toplamKazanc} SHT</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Henüz kayıtlı bir tohumunuz yok.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tohum Siparişini Onayla</DialogTitle>
          <DialogDescription>
            {selectedSeed?.isim} tohumunu satın almak üzeresiniz. Lütfen gönderim adresini girin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Gönderim Adresi</Label>
            <Input 
              id="address" 
              placeholder="Tam adresinizi girin" 
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            />
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>{selectedSeed?.fiyat} SHT</strong> cüzdanınızdan düşülecektir.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSeedPurchase}>Onayla ve Satın Al</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
