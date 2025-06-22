import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Check, AlertCircle } from "lucide-react"

interface WaterSavingsPanelProps {
  savingsPercent: number
  wallet: string | null
  onRewardClaimed: () => void
  onNotification: (message: string) => void
}

export default function WaterSavingsPanel({ 
  savingsPercent, 
  wallet, 
  onRewardClaimed,
  onNotification
}: WaterSavingsPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const rewardAmount = Math.max(5, Math.round(savingsPercent / 2))

  const claimReward = async () => {
    if (!wallet || claimed) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch("http://localhost:4000/api/conservation-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, amount: rewardAmount }),
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      if (data.success) {
        setClaimed(true)
        onNotification(`Tebrikler! ${rewardAmount} Su Hakkı Token kazandınız`)
        onRewardClaimed()
      } else {
        throw new Error(data.error || "Bilinmeyen bir hata oluştu")
      }
    } catch (error) {
      console.error("Ödül alınamadı", error)
      const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu, lütfen tekrar deneyin"
      setError(errorMessage)
      onNotification(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-green-200 to-emerald-100 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2 text-green-800">
          <Award className="h-5 w-5 text-green-600" />
          Su Tasarrufu Ödülü
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-green-700">
            Ortalamanıza göre <strong>%{savingsPercent}</strong> daha az su kullanarak tasarruf sağladınız!
          </p>
          <p className="text-sm text-green-600 mt-1">
            Bu tasarruf karşılığında <strong>{rewardAmount} Su Hakkı Token</strong> kazandınız.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {!claimed ? (
          <Button 
            onClick={claimReward} 
            disabled={isLoading || !wallet} 
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                İşleniyor...
              </div>
            ) : (
              "Ödülü Talep Et"
            )}
          </Button>
        ) : (
          <div className="bg-white rounded-md p-3 flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            <span>Ödül başarıyla talep edildi!</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}