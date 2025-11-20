const express = require('express');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all rooms
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new room
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    
    // Check if room already exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room already exists' });
    }
    
    // Create new room
    const room = new Room({
      name,
      description,
      isPrivate: isPrivate || false,
      createdBy: req.user._id,
      members: [{ userId: req.user._id }]
    });
    
    await room.save();
    await room.populate('createdBy', 'username');
    
    res.status(201).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a room
router.post('/:roomId/join', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is already a member
    const isMember = room.members.some(
      member => member.userId.toString() === req.user._id.toString()
    );
    
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this room' });
    }
    
    // Add user to room
    room.members.push({ userId: req.user._id });
    await room.save();
    
    res.json({ message: 'Joined room successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;