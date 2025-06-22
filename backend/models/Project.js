import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  isim: {
    type: String,
    required: true,
  },
  aciklama: {
    type: String,
    required: true,
  },
  resim: {
    type: String,
  },
  hedef: {
    type: Number,
    required: true,
  },
  toplanan: {
    type: Number,
    default: 0,
  },
  katilimci: {
    type: Number,
    default: 0,
  },
  kalanGun: {
    type: Number,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approved: {
    type: Boolean,
    default: true
  }
});

export const Project = mongoose.model('Project', ProjectSchema);