import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Zap, Heart, Target, Users } from "lucide-react"

interface DemoNotification {
  id: string
  type: "achievement" | "milestone" | "community" | "token"
  title: string
  message: string
  icon: React.ReactNode
  color: string
  duration: number
}

interface DemoNotificationsProps {
  userStats: any
  totalUsage: number
  leaderboard: any[]
  currentRank: number
}

export default function DemoNotifications({ 
  userStats, 
  totalUsage, 
  leaderboard, 
  currentRank 
}: DemoNotificationsProps) {
  const [notifications, setNotifications] = useState<DemoNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (!userStats || !totalUsage) return

    const newNotifications: DemoNotification[] = []

    // Başarı rozetleri
    if (totalUsage >= 100 && totalUsage < 200) {
      newNotifications.push({
        id: "first-save",
        type: "achievement",
        title: "🎉 İlk Tasarruf Rozeti!",
        message: "100 litre tasarruf yaparak ilk rozetini kazandın!",
        icon: <Target className="h-4 w-4" />,
        color: "bg-green-500",
        duration: 5000
      })
    }

    if (totalUsage >= 1000 && totalUsage < 1100) {
      newNotifications.push({
        id: "water-warrior",
        type: "achievement",
        title: "🛡️ Su Savaşçısı!",
        message: "1000 litre tasarruf yaparak Su Savaşçısı rozetini kazandın!",
        icon: <Star className="h-4 w-4" />,
        color: "bg-blue-500",
        duration: 5000
      })
    }

    // Token başarıları
    if (userStats.totalTokensEarned >= 100 && userStats.totalTokensEarned < 150) {
      newNotifications.push({
        id: "token-collector",
        type: "token",
        title: "💰 Token Koleksiyoncusu!",
        message: "100 token topladın! Artık token transferleri yapabilirsin.",
        icon: <Trophy className="h-4 w-4" />,
        color: "bg-yellow-500",
        duration: 5000
      })
    }

    // Liderlik başarıları
    if (currentRank <= 3 && currentRank > 0) {
      newNotifications.push({
        id: "top-performer",
        type: "milestone",
        title: "🏆 Liderlik Tablosunda!",
        message: `Liderlik tablosunda ${currentRank}. sıradasın! Tebrikler!`,
        icon: <Users className="h-4 w-4" />,
        color: "bg-orange-500",
        duration: 5000
      })
    }

    // Topluluk etkisi
    if (leaderboard.length >= 5) {
      const totalCommunitySavings = leaderboard.reduce((sum, user) => sum + user.savings, 0)
      if (totalCommunitySavings >= 10000) {
        newNotifications.push({
          id: "community-impact",
          type: "community",
          title: "🌍 Toplumsal Etki!",
          message: `Topluluk olarak ${totalCommunitySavings.toLocaleString()} litre su tasarruf ettik!`,
          icon: <Heart className="h-4 w-4" />,
          color: "bg-purple-500",
        duration: 5000
        })
      }
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications])
      setShowNotifications(true)
    }
  }, [userStats, totalUsage, leaderboard, currentRank])

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1))
        if (notifications.length <= 1) {
          setShowNotifications(false)
        }
      }, notifications[0]?.duration || 5000)

      return () => clearTimeout(timer)
    }
  }, [notifications])

  if (!showNotifications || notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.slice(0, 3).map((notification) => (
        <Card
          key={notification.id}
          className={`animate-in slide-in-from-right-5 duration-300 border-l-4 border-l-${notification.color.split('-')[1]}-500 shadow-lg`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${notification.color} text-white`}>
                {notification.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{notification.title}</div>
                <div className="text-xs text-gray-600">{notification.message}</div>
              </div>
              <Badge variant="outline" className="text-xs">
                Yeni!
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 