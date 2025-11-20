const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  content: {
  type: String,
  trim: true,
  default: '' // optional now, defaults to empty string
},

  room: {
    type: String,
    default: 'global'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replies: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
    angry: { type: Number, default: 0 }
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  fileUrl: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    enum: ['image', 'document', 'audio', 'video', ''],
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);