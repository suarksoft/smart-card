"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Leaf, CheckCircle2, XCircle, Rocket, Sparkles, PartyPopper } from "lucide-react"
import { toast as sonnerToast } from "sonner"

type Step = 'form' | 'approved' | 'tokenized' | 'rejected';

export default function ProjeBasvuruPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { walletAddress, isConnected } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDesc, setProjectDesc] = useState("")
  const [result, setResult] = useState<{score: number, feedback: string, approved: boolean} | null>(null)
  const [step, setStep] = useState<Step>('form');

  const resetForm = () => {
    setProjectName("")
    setProjectDesc("")
    setResult(null)
    setStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !walletAddress) {
      toast({
        title: "Cüzdan Bağlı Değil",
        description: "Lütfen önce cüzdanınızı bağlayın.",
        variant: "destructive",
      })
      return
    }

    if (!projectName || !projectDesc) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen proje adı ve açıklamasını doldurun.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await fetch("http://localhost:4000/api/evaluate-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          projectName,
          projectDesc
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        if (data.approved) {
          setStep('approved')
          sonnerToast.success("Projeniz Onaylandı! 🎉", {
            description: "Projeniz yapay zeka değerlendirmesini başarıyla geçti.",
          })
        } else {
          setStep('rejected')
          sonnerToast.error("Projeniz Onaylanmadı", {
            description: "Projeniz çevre dostu kriterlerine yeterince uygun değil.",
          })
        }
      } else {
        setStep('form');
        toast({
          title: "Değerlendirme Hatası",
          description: data.error || "Projeniz değerlendirilirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Proje değerlendirme hatası:", error)
      setStep('form');
      toast({
        title: "Sunucu Hatası",
        description: "Sunucu bağlantısında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTokenize = () => {
    setIsSubmitting(true);
    sonnerToast.info("Tokenizasyon işlemi başlatılıyor...", {
      description: "Projeniz için tokenler oluşturuluyor ve fonlamaya hazırlanıyor."
    })
    // Mock bir gecikme
    setTimeout(() => {
      setStep('tokenized');
      setIsSubmitting(false);
      sonnerToast.success("Tokenizasyon Tamamlandı!", {
        description: `${projectName} projesi artık topluluk fonlamasına hazır.`
      })
    }, 2000);
  }

  const renderContent = () => {
    switch (step) {
      case 'rejected':
        return (
          <Card className="border-red-500">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">Projeniz Onaylanmadı</span>
              </CardTitle>
              <CardDescription>
                Değerlendirme Puanı: <span className="font-semibold">{result?.score}/100</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-2">Değerlendirme:</h3>
              <p className="text-sm whitespace-pre-line">{result?.feedback}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={resetForm}
              >
                Projeyi Düzenle
              </Button>
            </CardFooter>
          </Card>
        );

      case 'approved':
        return (
          <Card className="border-teal-500">
            <CardHeader className="bg-teal-50">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-teal-600" />
                <span className="text-teal-800">Projenizi Tokenize Edin</span>
              </CardTitle>
              <CardDescription>
                Projeniz onaylandı! Şimdi projenize özel token oluşturarak fon toplamaya başlayın.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Mock Tokenizasyon Detayları</h3>
                <div className="text-sm space-y-2 p-3 bg-gray-50 rounded-md border">
                  <p><strong>Proje Token Adı:</strong> {projectName} Token</p>
                  <p><strong>Token Sembolü:</strong> {projectName.substring(0,3).toUpperCase()}T</p>
                  <p><strong>Toplam Arz:</strong> 1,000,000</p>
                  <p><strong>Fonlama Hedefi:</strong> 5,000 SHT</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Bu veriler temsilidir. "Tokenize Et" butonuna basıldığında kontratınız oluşturulacak ve projeniz bağış listesine eklenecektir.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              <Button 
                onClick={handleTokenize}
                disabled={isSubmitting}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isSubmitting ? "Oluşturuluyor..." : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Tokenize Et ve Fonlamayı Başlat
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      case 'tokenized':
        return (
          <Card className="border-green-500">
            <CardHeader className="bg-green-50 text-center">
              <div className="mx-auto w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mb-4">
                <PartyPopper className="h-8 w-8" />
              </div>
              <CardTitle className="text-green-800">Tebrikler, Projeniz Fonlamaya Hazır!</CardTitle>
              <CardDescription>
                {projectName} projesi başarıyla tokenize edildi ve bağış sayfasında listelendi.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-col sm:flex-row justify-center gap-2 pt-4">
              <Button onClick={() => router.push('/bagis')}>
                Bağış Sayfasına Git
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
              >
                Yeni Proje Başvurusu Yap
              </Button>
            </CardFooter>
          </Card>
        );

      case 'form':
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-teal-600" />
                <span>Proje Başvurusu</span>
              </CardTitle>
              <CardDescription>
                Çevre dostu projenizi detaylı açıklayın. Değerlendirme sonucunda 70/100 ve üzeri puan alan projeler bağış listesine eklenecektir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="projectName" className="text-sm font-medium">
                    Proje Adı
                  </label>
                  <Input 
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Örn: Yağmur Suyu Toplama Sistemi"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="projectDesc" className="text-sm font-medium">
                    Proje Açıklaması
                  </label>
                  <Textarea 
                    id="projectDesc"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    placeholder="Projenizin amacını, çevresel etkisini ve nasıl uygulanacağını detaylı olarak açıklayın..."
                    rows={8}
                    disabled={isSubmitting}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Projenizin çevresel faydalarını, sürdürülebilirlik açısından önemini ve topluma nasıl katkı sağlayacağını vurgulayın.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || !isConnected}
                >
                  {isSubmitting ? "Değerlendiriliyor..." : "Değerlendirmeye Gönder"}
                </Button>
              </form>
            </CardContent>
          </Card>
        );
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => router.back()}
        disabled={step !== 'form'}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Geri Dön
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-teal-800 mb-2">Projenizi Fonlatın</h1>
        <p className="text-muted-foreground">
          Çevre dostu projenizi topluluğa sunun ve Su Hakkı Token ile fonlanın.
        </p>
      </div>

      {renderContent()}
    </div>
  )
}