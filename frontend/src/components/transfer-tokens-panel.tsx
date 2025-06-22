import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

interface TransferTokensPanelProps {
  wallet: string
  tokenBalance: number
  onTransfer: () => void
  onNotification: (message: string) => void
}

export default function TransferTokensPanel({ 
  wallet, 
  tokenBalance, 
  onTransfer,
  onNotification
}: TransferTokensPanelProps) {
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!wallet || !toAddress || !amount) return
    
    const transferAmount = parseInt(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      onNotification("Lütfen geçerli bir miktar girin")
      return
    }
    
    if (transferAmount > tokenBalance) {
      onNotification("Yetersiz token bakiyesi")
      return
    }
    
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:4000/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fromWallet: wallet, 
          toWallet: toAddress, 
          amount: transferAmount 
        }),
      })
      
      const data = await res.json()
      if (data.success) {
        onNotification(`${transferAmount} token başarıyla transfer edildi`)
        setToAddress("")
        setAmount("")
        onTransfer()
      } else {
        onNotification(`Hata: ${data.error}`)
      }
    } catch (error) {
      console.error("Transfer başarısız", error)
      onNotification("Bir hata oluştu, lütfen tekrar deneyin")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-blue-500" />
          Token Transfer Et
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Alıcı Adresi
            </label>
            <Input
              id="toAddress"
              placeholder="Alıcının cüzdan adresi"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Miktar
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="Transfer edilecek token miktarı"
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
            disabled={isLoading || !wallet || !toAddress || !amount || parseInt(amount) > tokenBalance} 
            className="w-full"
          >
            {isLoading ? "İşleniyor..." : "Transfer Et"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}