import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard } from "lucide-react"

interface WaterCardFormProps {
  onSubmit: (cardId: string) => void
}

export default function WaterCardForm({ onSubmit }: WaterCardFormProps) {
  const [cardId, setCardId] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cardId.trim()) {
      onSubmit(cardId.trim())
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-500" />
          Su Kartınızı Kaydedin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cardId" className="block text-sm font-medium text-gray-700 mb-1">
              Su Kartı ID Numarası
            </label>
            <Input
              id="cardId"
              placeholder="Örn: 12345678"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              className="w-full"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Demo için kullanılabilir örnek ID'ler: 12345678, 87654321, 55555555
            </p>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Kartı Kaydet
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}