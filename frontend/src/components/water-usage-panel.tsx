import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplet, Users } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface WaterUsagePanelProps {
  usageData: {
    cardId: string
    averageUsage: number
    lastWeekAverage: number
    isSaving: boolean
  }
  communityAverage: number
}

export default function WaterUsagePanel({ usageData, communityAverage }: WaterUsagePanelProps) {
  const efficiencyPercentage = Math.min(
    100,
    Math.max(0, 100 - (usageData.lastWeekAverage / communityAverage) * 100)
  )
  
  const getEfficiencyColor = () => {
    if (efficiencyPercentage > 20) return "text-green-600"
    if (efficiencyPercentage > 0) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-500" />
          Su Kullanım Özeti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-700 mb-1">Günlük Ortalama Kullanımınız</div>
            <div className="text-2xl font-bold">{usageData.averageUsage} litre</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-700 mb-1">Son Hafta Ortalamanız</div>
            <div className="text-2xl font-bold">{usageData.lastWeekAverage} litre</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Toplum Ortalamasına Göre Verimlilik</span>
            <span className={`text-sm font-medium ${getEfficiencyColor()}`}>
              {efficiencyPercentage > 0 ? `%${Math.round(efficiencyPercentage)} verimli` : "Ortalamanın üzerinde"}
            </span>
          </div>
          <Progress value={efficiencyPercentage} className="h-2" />
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
          <Users className="h-5 w-5 text-gray-500" />
          <div>
            <div className="text-sm text-gray-600">Toplum Ortalaması</div>
            <div className="font-medium">{communityAverage} litre/gün</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}