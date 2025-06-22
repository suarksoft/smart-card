import { Card, CardContent } from "@/components/ui/card"
import { Coins } from "lucide-react"

interface TokenPanelProps {
  tokens: number
  tokenName: string
}

export default function TokenPanel({ tokens, tokenName }: TokenPanelProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Coins className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Toplam {tokenName}</div>
            <div className="text-2xl font-bold">{tokens}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}