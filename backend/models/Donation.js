import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    index: true,
  },
  projectId: {
    type: String,
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  txHash: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Donation = mongoose.model('Donation', DonationSchema);