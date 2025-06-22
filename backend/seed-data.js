import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { WaterCard } from './models/WaterCard.js';

dotenv.config();

// MongoDB'ye bağlan
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

// Örnek kullanıcı verileri
const sampleUsers = [
  {
    cardId: 'WC001',
    walletAddress: 'GABC1234567890123456789012345678901234567890',
    name: 'Ahmet Yılmaz'
  },
  {
    cardId: 'WC002', 
    walletAddress: 'GDEF1234567890123456789012345678901234567890',
    name: 'Ayşe Demir'
  },
  {
    cardId: 'WC003',
    walletAddress: 'GGHI1234567890123456789012345678901234567890', 
    name: 'Mehmet Kaya'
  },
  {
    cardId: 'WC004',
    walletAddress: 'GJKL1234567890123456789012345678901234567890',
    name: 'Fatma Özkan'
  },
  {
    cardId: 'WC005',
    walletAddress: 'GMNO1234567890123456789012345678901234567890',
    name: 'Ali Çelik'
  }
];

// Son 30 günlük gerçekçi su kullanım verileri oluştur
const generateUsageData = (days = 30) => {
  const usageData = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Gerçekçi su kullanım miktarları (80-200 litre arası)
    const baseAmount = Math.random() * 120 + 80;
    // Hafta sonları biraz daha fazla kullanım
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const amount = isWeekend ? baseAmount * 1.2 : baseAmount;
    
    usageData.push({
      date: date,
      amount: Math.round(amount)
    });
  }
  
  return usageData;
};

// Token ödülleri oluştur
const generateRewards = (totalUsage) => {
  const rewards = [];
  const today = new Date();
  
  // Tasarruf ödülleri (her 100 litre tasarruf için 10 token)
  const conservationAmount = Math.floor(totalUsage / 100) * 10;
  if (conservationAmount > 0) {
    rewards.push({
      date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 hafta önce
      amount: conservationAmount,
      reason: 'conservation'
    });
  }
  
  // Haftalık bonus
  rewards.push({
    date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 gün önce
    amount: 25,
    reason: 'weekly_bonus'
  });
  
  return rewards;
};

// Veritabanını temizle ve örnek verileri ekle
const seedDatabase = async () => {
  try {
    console.log('🗑️  Mevcut veriler temizleniyor...');
    await WaterCard.deleteMany({});
    
    console.log('🌱 Örnek veriler ekleniyor...');
    
    for (const user of sampleUsers) {
      const usageData = generateUsageData();
      const totalUsage = usageData.reduce((sum, data) => sum + data.amount, 0);
      const rewards = generateRewards(totalUsage);
      
      const waterCard = new WaterCard({
        cardId: user.cardId,
        walletAddress: user.walletAddress,
        usage: usageData,
        rewards: rewards
      });
      
      await waterCard.save();
      console.log(`✅ ${user.name} (${user.cardId}) için veriler eklendi`);
      console.log(`   - Toplam kullanım: ${totalUsage} litre`);
      console.log(`   - Toplam ödül: ${rewards.reduce((sum, r) => sum + r.amount, 0)} token`);
    }
    
    console.log('\n🎉 Veritabanı başarıyla dolduruldu!');
    console.log('📊 Demo için hazır örnek veriler:');
    
    // İstatistikleri göster
    const allCards = await WaterCard.find({});
    const totalUsers = allCards.length;
    const totalUsage = allCards.reduce((sum, card) => 
      sum + card.usage.reduce((cardSum, usage) => cardSum + usage.amount, 0), 0
    );
    const totalRewards = allCards.reduce((sum, card) => 
      sum + card.rewards.reduce((cardSum, reward) => cardSum + reward.amount, 0), 0
    );
    
    console.log(`   - Toplam kullanıcı: ${totalUsers}`);
    console.log(`   - Toplam su kullanımı: ${totalUsage} litre`);
    console.log(`   - Toplam verilen token: ${totalRewards}`);
    
  } catch (error) {
    console.error('❌ Veri ekleme hatası:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Veritabanı bağlantısı kapatıldı');
  }
};

// Scripti çalıştır
connectDB().then(() => {
  seedDatabase();
}); 