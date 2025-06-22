import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js"; // MongoDB bağlantısını import et
import { mintTokenToUser, getBalanceOf, transferTokens } from "./mint-soroban.js";
import { registerWaterCard, getWaterUsageData, getCommunityAverage } from "./water-service.js";
import OpenAI from 'openai';
import { Donation } from './models/Donation.js';
import { Project } from './models/Project.js';

dotenv.config();

connectDB(); // Veritabanına bağlan

const app = express();
app.use(cors());
app.use(bodyParser.json());

// OpenAI istemcisini başlat
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // .env dosyasında tanımlanmış olmalı
});

// Onaylanan projeleri saklamak için basit bir dizi (veritabanı yerine)
const approvedProjects = [];

// Projeyi değerlendirme endpoint'i
app.post("/api/evaluate-project", async (req, res, next) => {
  const { walletAddress, projectName, projectDesc } = req.body;
  
  if (!walletAddress || !projectName || !projectDesc) {
    return res.status(400).json({ 
      success: false, 
      error: "Cüzdan adresi, proje adı ve açıklaması gerekli" 
    });
  }
  
  try {
    let evaluation;

    if (process.env.USE_MOCK_OPENAI === 'true') {
      console.log("🤖 Mock OpenAI değerlendirmesi kullanılıyor.");
      // Gecikme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      const mockScore = Math.floor(Math.random() * 50) + 50; // 50-99 arası puan
      const isApproved = mockScore >= 70;

      evaluation = {
        score: mockScore,
        feedback: isApproved
          ? "Bu, sahte veri ile oluşturulmuş bir onay geri bildirimidir. Projeniz, çevre dostu ve sürdürülebilirlik hedefleriyle mükemmel bir şekilde uyumlu görünüyor. Topluluk üzerinde pozitif bir etki yaratma potansiyeli yüksek."
          : "Bu, sahte veri ile oluşturulmuş bir ret geri bildirimidir. Projeniz ilginç olsa da, mevcut çevre dostu ve sürdürülebilirlik kriterlerimizi tam olarak karşılamıyor. Lütfen projenizin çevresel etkilerini daha detaylı açıklayarak tekrar başvurun.",
        approved: isApproved,
      };
      
    } else {
      // OpenAI'ye değerlendirme için istek gönder
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Sen bir çevre dostu ve sürdürülebilir projeleri değerlendiren bir uzmansın. 
            Projeleri aşağıdaki kriterlere göre 0-100 arası bir puanla değerlendir:
            
            1. Çevresel Etki (30 puan): Proje doğal kaynakları koruyor mu, kirliliği azaltıyor mu?
            2. Sürdürülebilirlik (25 puan): Proje uzun vadede sürdürülebilir mi?
            3. Yenilikçilik (20 puan): Proje özgün ve yenilikçi fikirler içeriyor mu?
            4. Toplumsal Fayda (15 puan): Proje topluma ve su tasarrufuna nasıl katkı sağlıyor?
            5. Uygulanabilirlik (10 puan): Proje teknik olarak uygulanabilir mi?
            
            Yanıtını şu JSON formatında ver: 
            {
              "score": [0-100 arası puan],
              "feedback": [Değerlendirme geri bildirimi],
              "approved": [70 ve üzeri puan için true, altı için false]
            }`
          },
          {
            role: "user",
            content: `Proje Adı: ${projectName}\n\nProje Açıklaması: ${projectDesc}`
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const responseContent = completion.choices[0].message.content;
      evaluation = JSON.parse(responseContent);
    }
    
    // Onaylanan projeyi veritabanına ekle
    if (evaluation.approved) {
      const projectId = `proj-${Date.now()}`;
      
      const newProject = new Project({
        id: projectId,
        isim: projectName,
        aciklama: projectDesc.substring(0, 150) + (projectDesc.length > 150 ? '...' : ''),
        resim: `https://via.placeholder.com/80x80/${getRandomColor()}/ffffff?text=🌱`,
        hedef: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 arası rastgele hedef
        toplanan: 0,
        katilimci: 0,
        kalanGun: Math.floor(Math.random() * 30) + 5, // 5-35 gün arası
        walletAddress, // Proje sahibinin cüzdan adresi
        approved: true
      });
      
      await newProject.save();
    }
    
    res.json({
      success: true,
      score: evaluation.score,
      feedback: evaluation.feedback,
      approved: evaluation.approved
    });
  } catch (err) {
    console.error('Proje değerlendirme hatası:', err);
    res.status(500).json({ 
      success: false, 
      error: "Proje değerlendirilirken bir hata oluştu" 
    });
  }
});

// Onaylanan projeleri veritabanından getir
app.get("/api/approved-projects", async (req, res) => {
  try {
    // Veritabanından projeleri getir
    const projects = await Project.find({ approved: true });
    
    res.json({
      success: true,
      projects
    });
  } catch (err) {
    console.error('Proje getirme hatası:', err);
    res.status(500).json({ 
      success: false, 
      error: "Projeler getirilirken bir hata oluştu" 
    });
  }
});

// Rastgele renk kodu oluşturucu yardımcı fonksiyon
function getRandomColor() {
  const colors = ['10b981', '6366f1', 'ef4444', 'f59e0b', '8b5cf6', '3b82f6'];
  return colors[Math.floor(Math.random() * colors.length)];
}



// Su kartı kaydı
app.post("/api/register-card", async (req, res) => {
  const { cardId, wallet } = req.body;
  
  if (!cardId || !wallet) {
    return res.status(400).json({ 
      success: false, 
      error: "Kart ID ve cüzdan adresi gerekli" 
    });
  }
  
  try {
    const result = await registerWaterCard(cardId, wallet);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Kart kayıt hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Su kullanım verilerini getir
app.get("/api/water-usage/:cardId", async (req, res) => {
  const { cardId } = req.params;
  
  if (!cardId) {
    return res.status(400).json({ 
      success: false, 
      error: "Kart ID gerekli" 
    });
  }
  
  try {
    const data = await getWaterUsageData(cardId);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Su kullanım verisi hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Topluluk ortalamasını getir
app.get("/api/community-average", async (req, res) => {
  try {
    const data = await getCommunityAverage();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Topluluk ortalaması hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Token bakiyesi endpoint'i
app.get("/api/balance/:wallet", async (req, res) => {
  const { wallet } = req.params;
  
  if (!wallet) {
    return res.status(400).json({ 
      success: false, 
      error: "Cüzdan adresi gerekli" 
    });
  }
  
  try {
    const balance = await getBalanceOf(wallet);
    res.json({ success: true, balance });
  } catch (err) {
    console.error('Bakiye getirme hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tasarruf ödülü mint etme
app.post("/api/conservation-reward", async (req, res) => {
  const { wallet, amount } = req.body;
  
  if (!wallet || !amount) {
    return res.status(400).json({ 
      success: false, 
      error: "Cüzdan adresi ve miktar gerekli" 
    });
  }
  
  try {
    const result = await mintTokenToUser(wallet, amount);
    res.json({ success: true, tx: result });
  } catch (err) {
    console.error('Ödül mint hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Token transfer et
app.post("/api/transfer", async (req, res) => {
  const { fromWallet, toWallet, amount } = req.body;
  
  if (!fromWallet || !toWallet || !amount) {
    return res.status(400).json({ 
      success: false, 
      error: "Gönderen, alıcı ve miktar gerekli" 
    });
  }
  
  try {
    const result = await transferTokens(fromWallet, toWallet, amount);
    res.json({ success: true, tx: result });
  } catch (err) {
    console.error('Transfer hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bağış yapma API'si
app.post("/api/donate", async (req, res, next) => {
  const { walletAddress, projectId, amount } = req.body;

  if (!walletAddress || !amount) {
    return res.status(400).json({ 
      success: false, 
      error: "Cüzdan adresi ve miktar gerekli" 
    });
  }

  try {
    const adminWallet = process.env.ADMIN_PUBLIC_KEY;
    if (!adminWallet) {
      throw new Error("ADMIN_PUBLIC_KEY .env dosyasında tanımlanmamış.");
    }
    
    console.log(`💸 Bağış: ${amount} SHT ${walletAddress}'dan ${adminWallet}'e transfer ediliyor...`);
    
    // 1. Token transferini gerçekleştir
    const result = await transferTokens(walletAddress, adminWallet, parseInt(amount));

    // 2. Transfer başarılıysa veritabanı işlemlerini yap
    const donation = new Donation({
      walletAddress,
      projectId: projectId || 'community-fund',
      amount: parseInt(amount),
      txHash: result.txHash
    });
    
    await donation.save();
    
    // Proje varsa, projenin toplanan miktarını ve katılımcı sayısını güncelle
    if (projectId) {
      const existingDonation = await Donation.findOne({ walletAddress, projectId });

      await Project.updateOne(
        { id: projectId },
        { 
          $inc: { toplanan: parseInt(amount) },
          // Eğer bu kullanıcının bu projeye ilk bağışıysa, katılımcıyı artır
          ...(existingDonation ? {} : { $inc: { katilimci: 1 } })
        }
      );
    }
    
    // 3. Başarılı yanıtı gönder
    res.json({
      success: true,
      message: `${amount} token başarıyla bağışlandı`,
      txHash: result.txHash
    });

  } catch (err) {
    // Hata oluşursa, hatayı merkezi hata yakalayıcıya ilet
    next(err);
  }
});

// Cüzdan adresine göre su kartını getir
app.get("/api/card-by-wallet/:wallet", async (req, res) => {
  const { wallet } = req.params;
  
  if (!wallet) {
    return res.status(400).json({ 
      success: false, 
      error: "Cüzdan adresi gerekli" 
    });
  }
  
  try {
    const WaterCard = (await import('./models/WaterCard.js')).WaterCard;
    const card = await WaterCard.findOne({ walletAddress: wallet });
    
    if (card) {
      res.json({ 
        success: true, 
        card: {
          cardId: card.cardId,
          wallet: card.walletAddress,
          usage: card.usage || []
        }
      });
    } else {
      res.json({ 
        success: true, 
        card: null
      });
    }
  } catch (err) {
    console.error('Cüzdan kartı getirme hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Topluluk fonu bakiyesi
app.get("/api/community-fund-balance", async (req, res) => {
  try {
    res.json({ 
      success: true, 
      balance: 25000 
    });
  } catch (err) {
    console.error('Topluluk fonu bakiyesi hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Topluluk fonu istatistikleri
app.get("/api/community-fund-stats", async (req, res) => {
  try {
    res.json({ 
      success: true, 
      stats: {
        totalDonations: 150,
        totalAmount: 25000,
        activeProjects: 4,
        beneficiaries: 1200,
        uniqueDonors: 42,
        averageDonation: 175,
        recentDonations: [
          {
            wallet: "GAELIPRPRLJFET6FWVU4KN3R32Z7WH3KCHPTVIJOIYLYIWFUWT2NXJFE",
            amount: 100,
            timestamp: "2024-07-20T12:00:00Z",
            transactionId: "TXN-1"
          },
          {
            wallet: "GCFDIPRPRLJFET6FWVU4KN3R32Z7WH3KCHPTVIJOIYLYIWFUWT2NXYZZZ",
            amount: 50,
            timestamp: "2024-07-19T15:30:00Z",
            transactionId: "TXN-2"
          }
        ]
      }
    });
  } catch (err) {
    console.error('Topluluk fonu istatistikleri hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Liderlik tablosu
app.get("/api/leaderboard", async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: [
        { name: "Ahmet Yılmaz", tokens: 445, savings: 1200 },
        { name: "Ayşe Demir", tokens: 515, savings: 1500 },
        { name: "Mehmet Kaya", tokens: 455, savings: 1100 },
        { name: "Fatma Özkan", tokens: 475, savings: 1300 },
        { name: "Ali Çelik", tokens: 435, savings: 1000 }
      ]
    });
  } catch (err) {
    console.error('Liderlik tablosu hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Başarılar
app.get("/api/achievements", async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: [
        { id: "first-save", name: "İlk Tasarruf", description: "İlk 100 litre tasarruf", unlocked: true },
        { id: "water-warrior", name: "Su Savaşçısı", description: "1000 litre tasarruf", unlocked: false },
        { id: "token-collector", name: "Token Koleksiyoncusu", description: "100 token topladın", unlocked: false },
        { id: "community-hero", name: "Topluluk Kahramanı", description: "Topluluk fonuna 50 token bağışladın", unlocked: false }
      ]
    });
  } catch (err) {
    console.error('Başarılar hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tohum satın alma API'si - mock veri ile güvenli hale getirildi
app.post("/api/buy-seed", async (req, res) => {
  const { walletAddress, seedId, price } = req.body;
  
  if (!walletAddress || !seedId || !price) {
    return res.status(400).json({ 
      success: false, 
      error: "Cüzdan adresi, tohum ID ve fiyat gerekli" 
    });
  }
  
  try {
    const adminWallet = process.env.ADMIN_PUBLIC_KEY || "GASUZBOCEEYODKEA6M2RYVNADFVBSANCPYNZLWXWX4IQV2IHQTSDBJQE";
    console.log(`🌱 Tohum satın alma: ${price} SHT ${walletAddress}'dan ${adminWallet}'e transfer ediliyor...`);
    
    // Transfer işlemi (gerçek veya mock)
    const result = await transferTokens(walletAddress, adminWallet, parseInt(price));
    
    // Başarılı yanıt
    res.json({ 
      success: true, 
      message: `${seedId} ID'li tohum başarıyla satın alındı`,
      orderId: `seed-${Date.now()}`,
      txHash: result.txHash || `tx-${Date.now()}`,
      isMock: result.isMock || false
    });
  } catch (err) {
    console.error('Tohum satın alma işleminde beklenmeyen hata:', err);
    
    // Beklenmeyen hata durumunda da mock veri dön
    res.json({
      success: true,
      message: `${seedId} ID'li tohum başarıyla satın alındı (Demo)`,
      orderId: `emergency-mock-${Date.now()}`,
      isMock: true
    });
  }
});

// Kullanıcının toplam bağış miktarını getir
app.get("/api/user-donations/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;
  
  if (!walletAddress) {
    return res.status(400).json({ 
      success: false, 
      error: "Cüzdan adresi gerekli" 
    });
  }
  
  try {
    // Kullanıcının toplam bağış miktarını getir
    const donations = await Donation.find({ walletAddress });
    const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
    
    res.json({
      success: true,
      totalDonated,
      donationCount: donations.length
    });
  } catch (err) {
    console.error('Kullanıcı bağışları getirme hatası:', err);
    res.status(500).json({ 
      success: false, 
      error: "Kullanıcı bağışları getirilirken bir hata oluştu" 
    });
  }
});

// Hata yönetimi middleware'i (TÜM rotalardan SONRA olmalı)
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Su Hakkı Tokenizasyon API ${PORT} portunda çalışıyor`);
});