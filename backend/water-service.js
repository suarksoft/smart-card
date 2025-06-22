import { WaterCard } from './models/WaterCard.js';

// Son 30 gün için başlangıç kullanım verileri oluşturur
function generateInitialUsage() {
  const usage = [];
  const today = new Date();
  const baseUsage = Math.floor(Math.random() * 100) + 100; // 100-200 litre arası temel kullanım

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dailyVariation = baseUsage * (0.8 + Math.random() * 0.4);
    usage.push({
      date: date.toISOString().split('T')[0],
      amount: Math.round(dailyVariation)
    });
  }
  return usage;
}

// Bir su kartını cüzdana kaydet
export async function registerWaterCard(cardId, walletAddress) {
  try {
    let card = await WaterCard.findOne({ cardId });

    if (card) {
      // Kart zaten varsa, sadece cüzdan adresini güncelle
      card.walletAddress = walletAddress;
    } else {
      // Kart yoksa, yeni kart oluştur ve başlangıç verilerini ekle
      const initialUsage = generateInitialUsage();
      card = new WaterCard({
        cardId,
        walletAddress,
        usage: initialUsage
      });
    }
    
    await card.save();
    return { cardId, walletAddress: card.walletAddress };
  } catch (error) {
    console.error('Su kartı kayıt hatası:', error);
    throw new Error('Su kartı kaydedilemedi');
  }
}

// Bir kart için su kullanım verilerini getir
export async function getWaterUsageData(cardId) {
  try {
    const card = await WaterCard.findOne({ cardId });

    if (!card) {
      // Kart bulunamadıysa demo veri döndür
      console.log(`Kart bulunamadı: ${cardId}, demo veri döndürülüyor`);
      const demoUsage = generateInitialUsage();
      const totalUsage = demoUsage.reduce((sum, day) => sum + day.amount, 0);
      const averageUsage = Math.round(totalUsage / demoUsage.length);
      const lastWeekAverage = Math.round(
        demoUsage.slice(-7).reduce((sum, day) => sum + day.amount, 0) / 7
      );
      
      return {
        cardId,
        usage: demoUsage,
        totalUsage,
        averageUsage,
        lastWeekAverage,
        isSaving: true,
        savingsPercent: 15
      };
    }
    
    const usage = card.usage;
    if (!usage || usage.length === 0) {
      return {
        cardId,
        usage: [],
        totalUsage: 0,
        averageUsage: 0,
        lastWeekAverage: 0,
        isSaving: false,
        savingsPercent: 0
      };
    }
    
    const totalUsage = usage.reduce((sum, day) => sum + day.amount, 0);
    const averageUsage = Math.round(totalUsage / usage.length);

    // Son 7 günün ortalamasını hesapla
    const lastWeekUsage = usage.slice(-7);
    const lastWeekAverage = Math.round(
      lastWeekUsage.reduce((sum, day) => sum + day.amount, 0) / lastWeekUsage.length
    );
    
    const communityAverageData = await getCommunityAverage();
    const communityAverage = communityAverageData.communityAverage;

    const isSaving = lastWeekAverage < communityAverage;
    const savingsPercent = isSaving && communityAverage > 0
      ? Math.round(((communityAverage - lastWeekAverage) / communityAverage) * 100) 
      : 0;
    
    return {
      cardId,
      usage: usage.map(u => ({ 
        date: u.date instanceof Date ? u.date.toISOString().split('T')[0] : u.date, 
        amount: u.amount 
      })),
      totalUsage,
      averageUsage,
      lastWeekAverage,
      isSaving,
      savingsPercent
    };
  } catch (error) {
    console.error('Su kullanım verisi getirme hatası:', error);
    // Hata durumunda demo veri döndür
    const demoUsage = generateInitialUsage();
    const totalUsage = demoUsage.reduce((sum, day) => sum + day.amount, 0);
    const averageUsage = Math.round(totalUsage / demoUsage.length);
    const lastWeekAverage = Math.round(
      demoUsage.slice(-7).reduce((sum, day) => sum + day.amount, 0) / 7
    );
    
    return {
      cardId,
      usage: demoUsage,
      totalUsage,
      averageUsage,
      lastWeekAverage,
      isSaving: true,
      savingsPercent: 15
    };
  }
}

// Topluluk ortalama kullanımını getir
export async function getCommunityAverage() {
  try {
    const allCards = await WaterCard.find({});
    let totalUsage = 0;
    let totalDays = 0;

    allCards.forEach(card => {
      if (card.usage && card.usage.length > 0) {
        totalUsage += card.usage.reduce((sum, day) => sum + day.amount, 0);
        totalDays += card.usage.length;
      }
    });

    const communityAverage = totalDays > 0 ? Math.round(totalUsage / totalDays) : 150; // Default değer
    
    return {
      communityAverage,
      totalUsers: allCards.length
    };
  } catch (error) {
    console.error('Topluluk ortalaması hesaplama hatası:', error);
    // Hata durumunda default değer döndür
    return {
      communityAverage: 150,
      totalUsers: 0
    };
  }
}