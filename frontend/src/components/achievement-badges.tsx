import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Target, Zap, Heart, Shield } from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface AchievementBadgesProps {
  userStats: any
  totalUsage: number
}

export default function AchievementBadges({ userStats, totalUsage }: AchievementBadgesProps) {
  const achievements: Achievement[] = [
    {
      id: "first-save",
      name: "İlk Tasarruf",
      description: "İlk 100 litre tasarruf yaptın",
      icon: <Target className="h-6 w-6" />,
      color: "bg-green-500",
      unlocked: totalUsage >= 100
    },
    {
      id: "water-warrior",
      name: "Su Savaşçısı",
      description: "1000 litre tasarruf yaptın",
      icon: <Shield className="h-6 w-6" />,
      color: "bg-blue-500",
      unlocked: totalUsage >= 1000,
      progress: Math.min(totalUsage, 1000),
      maxProgress: 1000
    },
    {
      id: "token-collector",
      name: "Token Koleksiyoncusu",
      description: "100 token topladın",
      icon: <Trophy className="h-6 w-6" />,
      color: "bg-yellow-500",
      unlocked: (userStats?.totalTokensEarned || 0) >= 100,
      progress: Math.min(userStats?.totalTokensEarned || 0, 100),
      maxProgress: 100
    },
    {
      id: "community-hero",
      name: "Topluluk Kahramanı",
      description: "Topluluk fonuna 50 token bağışladın",
      icon: <Heart className="h-6 w-6" />,
      color: "bg-red-500",
      unlocked: false // Bu özellik henüz implement edilmedi
    },
    {
      id: "streak-master",
      name: "Seri Ustası",
      description: "7 gün üst üste tasarruf yaptın",
      icon: <Zap className="h-6 w-6" />,
      color: "bg-purple-500",
      unlocked: false // Bu özellik henüz implement edilmedi
    },
    {
      id: "top-performer",
      name: "En İyi Performans",
      description: "Liderlik tablosunda ilk 3'e girdin",
      icon: <Star className="h-6 w-6" />,
      color: "bg-orange-500",
      unlocked: false // Bu özellik henüz implement edilmedi
    }
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Başarılarım
          <Badge variant="secondary" className="ml-auto">
            {unlockedCount}/{totalCount}
          </Badge>
        </CardTitle>
        <CardDescription>
          Su tasarrufu yolculuğunda kazandığın rozetler
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border transition-all ${
                achievement.unlocked
                  ? "bg-gradient-to-br from-green-50 to-blue-50 border-green-200"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1 rounded-full ${achievement.color} text-white`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{achievement.name}</div>
                  <div className="text-xs text-gray-600">{achievement.description}</div>
                </div>
                {achievement.unlocked && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                    ✓
                  </Badge>
                )}
              </div>
              
              {achievement.progress !== undefined && achievement.maxProgress && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>İlerleme</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        achievement.unlocked ? achievement.color : "bg-gray-300"
                      }`}
                      style={{
                        width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {unlockedCount === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Henüz hiç rozet kazanmadın. Su tasarrufu yapmaya başla!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 