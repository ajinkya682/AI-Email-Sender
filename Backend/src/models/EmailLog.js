import mongoose from 'mongoose';

const EmailLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String, // HTML content
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('EmailLog', EmailLogSchema);
