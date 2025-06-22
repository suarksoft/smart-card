import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { CalendarDays } from "lucide-react"

interface WaterUsageHistoryProps {
  usageData: {
    date: string
    amount: number
    unit: string
  }[]
}

export default function WaterUsageHistory({ usageData }: WaterUsageHistoryProps) {
  // Son 14 günlük veriyi göster
  const recentData = usageData.slice(-14);
  
  // Veriyi grafiğe uygun formata dönüştür
  const chartData = recentData.map(day => ({
    date: day.date.split('-').slice(1).join('/'), // '2023-06-15' -> '06/15' formatına dönüştür
    litre: day.amount
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-blue-500" />
          Su Kullanım Geçmişi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 mb-4">
          Son 14 günlük su kullanımınız
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickMargin={10}
                angle={-45}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}L`}
              />
              <Tooltip 
                formatter={(value) => [`${value} litre`, "Kullanım"]}
                labelFormatter={(label) => `Tarih: ${label}`}
              />
              <Bar 
                dataKey="litre" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-xs text-gray-400 mt-4 text-center">
          Not: Su kullanımı verileri günlük olarak litre cinsinden gösterilmektedir.
        </div>
      </CardContent>
    </Card>
  )
}