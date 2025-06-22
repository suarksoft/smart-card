import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js"; // MongoDB bağlantısını import et
import { mintTokenToUser, getBalanceOf, transferTokens } from "./mint-soroban.js";
import { registerWaterCard, getWaterUsageData, getCommunityAverage } from "./water-service.js";

dotenv.config();
connectDB(); // Veritabanına bağlan

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  });
});

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
    const result = await transferTokens(toWallet, amount);
    res.json({ success: true, tx: result });
  } catch (err) {
    console.error('Transfer hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Topluluk fonuna bağış yap
app.post("/api/donate", async (req, res) => {
  const { wallet, amount } = req.body;
  
  if (!wallet || !amount) {
    return res.status(400).json({ 
      success: false, 
      error: "Cüzdan adresi ve miktar gerekli" 
    });
  }
  
  try {
    const result = await transferTokens(process.env.COMMUNITY_FUND_ADDRESS, amount);
    res.json({ success: true, tx: result });
  } catch (err) {
    console.error('Bağış hatası:', err);
    res.status(500).json({ success: false, error: err.message });
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

// Tohum satın alma
app.post("/api/buy-seed", async (req, res) => {
  const { walletAddress, seedId, price, address } = req.body;
  
  if (!walletAddress || !seedId || !price) {
    return res.status(400).json({ 
      success: false, 
      error: "Cüzdan adresi, tohum ID ve fiyat gerekli" 
    });
  }
  
  try {
    console.log(`Tohum satın alındı: ${seedId} - ${price} SHT - ${walletAddress}`);
    res.json({ 
      success: true, 
      message: "Tohum başarıyla satın alındı",
      orderId: `ORDER-${Date.now()}`
    });
  } catch (err) {
    console.error('Tohum satın alma hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Su Hakkı Tokenizasyon API ${PORT} portunda çalışıyor`);
});