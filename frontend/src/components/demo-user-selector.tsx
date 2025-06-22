import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Trophy, Droplet } from "lucide-react"

interface DemoUser {
  name: string
  walletAddress: string
  cardId: string
  description: string
  stats: {
    totalUsage: number
    totalTokens: number
    rank: number
  }
}

const demoUsers: DemoUser[] = [
  {
    name: "Ahmet Yılmaz",
    walletAddress: "GABC1234567890123456789012345678901234567890",
    cardId: "WC001",
    description: "Aktif tasarrufçu, liderlik tablosunda 1. sırada",
    stats: {
      totalUsage: 4274,
      totalTokens: 445,
      rank: 1
    }
  },
  {
    name: "Ayşe Demir",
    walletAddress: "GDEF1234567890123456789012345678901234567890",
    cardId: "WC002",
    description: "Yeni başlayan, hızlı ilerleme kaydediyor",
    stats: {
      totalUsage: 4918,
      totalTokens: 515,
      rank: 2
    }
  },
  {
    name: "Mehmet Kaya",
    walletAddress: "GGHI1234567890123456789012345678901234567890",
    cardId: "WC003",
    description: "Orta seviye kullanıcı, düzenli tasarruf yapıyor",
    stats: {
      totalUsage: 4332,
      totalTokens: 455,
      rank: 3
    }
  },
  {
    name: "Fatma Özkan",
    walletAddress: "GJKL1234567890123456789012345678901234567890",
    cardId: "WC004",
    description: "Deneyimli kullanıcı, topluluk fonuna katkıda bulunuyor",
    stats: {
      totalUsage: 4530,
      totalTokens: 475,
      rank: 4
    }
  },
  {
    name: "Ali Çelik",
    walletAddress: "GMNO1234567890123456789012345678901234567890",
    cardId: "WC005",
    description: "Yeni üye, platformu keşfediyor",
    stats: {
      totalUsage: 4183,
      totalTokens: 435,
      rank: 5
    }
  }
]

interface DemoUserSelectorProps {
  onUserSelect: (user: DemoUser) => void
  currentUser?: DemoUser | null
}

export default function DemoUserSelector({ onUserSelect, currentUser }: DemoUserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Demo Kullanıcı Seç</span>
        </div>
        {currentUser && (
          <Badge variant="secondary" className="ml-2">
            {currentUser.name}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-sm">Demo Kullanıcıları</CardTitle>
            <CardDescription>
              Farklı kullanıcı profillerini test etmek için seçin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoUsers.map((user) => (
              <div
                key={user.walletAddress}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  currentUser?.walletAddress === user.walletAddress
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  onUserSelect(user)
                  setIsOpen(false)
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{user.name}</div>
                  <Badge variant="outline" className="text-xs">
                    #{user.stats.rank}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{user.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Droplet className="h-3 w-3" />
                    {user.stats.totalUsage}L
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {user.stats.totalTokens} SHT
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 