import mongoose from 'mongoose';

const UsageDataSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  unit: { type: String, default: 'litre' }
});

const WaterCardSchema = new mongoose.Schema({
  cardId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  usage: [UsageDataSchema] // Gömülü alt döküman olarak kullanım verileri
});

export const WaterCard = mongoose.model('WaterCard', WaterCardSchema);
export const UsageData = mongoose.model('UsageData', UsageDataSchema); 