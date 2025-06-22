"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function TestToastPage() {
  const { toast } = useToast()

  const testToast = () => {
    console.log("Test toast tetikleniyor...")
    toast({
      title: "Test Toast! 🎉",
      description: "Bu bir test toast mesajıdır.",
    })
  }

  const testErrorToast = () => {
    toast({
      title: "Test Hata Toast! ❌",
      description: "Bu bir test hata toast mesajıdır.",
      variant: "destructive",
    })
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Toast Test Sayfası</h1>
      
      <div className="space-y-2">
        <Button onClick={testToast} className="mr-2">
          Başarılı Toast Test Et
        </Button>
        
        <Button onClick={testErrorToast} variant="destructive">
          Hata Toast Test Et
        </Button>
      </div>
      
      <p className="text-sm text-gray-600">
        Bu sayfa toast sisteminin çalışıp çalışmadığını test etmek için oluşturulmuştur.
      </p>
    </div>
  )
} 