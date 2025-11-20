const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Get messages for a room or private chat
router.get('/', auth, async (req, res) => {
  try {
    const { room, userId, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (room) {
      query.room = room;
      query.isPrivate = false;
    } else if (userId) {
      query.isPrivate = true;
      query.$or = [
        { senderId: req.user._id, recipientId: userId },
        { senderId: userId, recipientId: req.user._id }
      ];
    } else {
      // Default to global room
      query.room = 'global';
      query.isPrivate = false;
    }
    
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Mark messages as read
    await Message.updateMany(
      {
        ...query,
        senderId: { $ne: req.user._id },
        'readBy.userId': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            userId: req.user._id,
            readAt: new Date()
          }
        }
      }
    );
    
    res.json(messages.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a reaction to a message
router.post('/:messageId/reaction', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body;
    
    if (!['like', 'love', 'laugh', 'angry'].includes(reaction)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    message.reactions[reaction] += 1;
    await message.save();
    
    res.json({ reactions: message.reactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reply to a message
router.post('/:messageId/reply', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const reply = {
      senderId: req.user._id,
      senderName: req.user.username,
      content,
      timestamp: new Date()
    };
    
    message.replies.push(reply);
    await message.save();
    
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;