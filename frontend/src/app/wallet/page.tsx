"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Droplet, Send, ArrowUpRight, ArrowDownLeft, Gift, Lock } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useWallet } from "@/lib/wallet-context"

// Tutarlı sayı formatlaması için yardımcı fonksiyon
const formatNumber = (num: number | undefined | null) => {
  if (num === undefined || num === null) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const transactions = [
  {
    id: "txn1",
    tarih: "20.07.24",
    tip: "Kazanıldı",
    aciklama: "Haftalık tasarruf bonusu",
    miktar: "+50 SHT",
    durum: "Tamamlandı",
    icon: ArrowDownLeft,
  },
  {
    id: "txn2",
    tarih: "18.07.24",
    tip: "Bağışlandı",
    aciklama: "Temiz Su Fonu'na bağış",
    miktar: "-100 SHT",
    durum: "Tamamlandı",
    icon: Gift,
  },
  {
    id: "txn3",
    tarih: "15.07.24",
    tip: "Tohum Bonusu",
    aciklama: "Domates tohumu için bonus",
    miktar: "+25 SHT",
    durum: "Tamamlandı",
    icon: ArrowDownLeft,
  },
  {
    id: "txn4",
    tarih: "13.07.24",
    tip: "Kazanıldı",
    aciklama: "Haftalık tasarruf bonusu",
    miktar: "+45 SHT",
    durum: "Tamamlandı",
    icon: ArrowDownLeft,
  },
  {
    id: "txn5",
    tarih: "10.07.24",
    tip: "Harcandı",
    aciklama: "Yerel kafe kuponu",
    miktar: "-75 SHT",
    durum: "Tamamlandı",
    icon: ArrowUpRight,
  },
]

export default function WalletPage() {
  const { walletAddress, isConnected, balance, loading, connectWallet } = useWallet()

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
              Cüzdan bilgilerinizi görüntülemek için cüzdanınızı bağlamanız gerekiyor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Demo Cüzdan</h4>
              <p className="text-sm text-blue-700">
                Bu demo için otomatik olarak test cüzdanı bağlanacak ve 5000 SHT token ile başlayacaksınız.
              </p>
            </div>
            <Button 
              onClick={connectWallet} 
              disabled={loading}
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
        <h1 className="text-xl font-bold text-aqua-800">Cüzdanım</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold text-aqua-800">Cüzdanım</h1>
        <Button variant="outline" className="border-aqua-200 text-aqua-700 hover:bg-aqua-50">
          <Send className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Token Gönder</span>
          <span className="sm:hidden">Gönder</span>
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-aqua-500 to-teal-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Droplet className="h-5 w-5 sm:h-6 sm:w-6" />
            Su Hakkı Token Bakiyem
          </CardTitle>
          <CardDescription className="text-aqua-100 text-sm">
            Stellar Soroban blockchain üzerindeki token bakiyen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            {loading ? (
              <p className="text-3xl sm:text-5xl font-bold mb-2">Yükleniyor...</p>
            ) : (
              <p className="text-3xl sm:text-5xl font-bold mb-2">{formatNumber(balance)} SHT</p>
            )}
            <p className="text-base sm:text-lg text-aqua-200">Demo cüzdan bakiyesi</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-aqua-300 break-all">
              Cüzdan: {walletAddress}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Bu Ay Kazanılan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">+245 SHT</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Tasarruf bonusları</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Bu Ay Bağışlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">-150 SHT</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Sosyal projeler</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Toplam Kazanç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">5.000 SHT</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Platform başlangıcından</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">İşlem Geçmişi</CardTitle>
          <CardDescription className="text-sm">Son Su Hakkı Token işlemleriniz</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {transactions.map((tx) => (
              <div key={tx.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <tx.icon className="h-4 w-4" />
                    <Badge
                      variant={tx.tip === "Kazanıldı" || tx.tip === "Tohum Bonusu" ? "default" : "secondary"}
                      className={
                        tx.tip === "Kazanıldı" || tx.tip === "Tohum Bonusu"
                          ? "bg-green-100 text-green-800 text-xs"
                          : tx.tip === "Bağışlandı"
                            ? "bg-blue-100 text-blue-800 text-xs"
                            : "bg-gray-100 text-gray-800 text-xs"
                      }
                    >
                      {tx.tip}
                    </Badge>
                  </div>
                  <span
                    className={`font-semibold text-sm ${tx.miktar.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                  >
                    {tx.miktar}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.aciklama}</p>
                  <p className="text-xs text-muted-foreground">{tx.tarih}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead className="text-right">Miktar</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.tarih}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.tip === "Kazanıldı" || tx.tip === "Tohum Bonusu" ? "default" : "secondary"}
                        className={
                          tx.tip === "Kazanıldı" || tx.tip === "Tohum Bonusu"
                            ? "bg-green-100 text-green-800"
                            : tx.tip === "Bağışlandı"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {tx.tip}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.aciklama}</TableCell>
                    <TableCell className={`text-right font-semibold ${tx.miktar.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                      {tx.miktar}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        {tx.durum}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
