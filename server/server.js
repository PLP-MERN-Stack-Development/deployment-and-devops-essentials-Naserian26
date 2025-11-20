const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

Sentry.init({
  dsn: process.env.SENTRY_DSN, // your DSN from Sentry
  tracesSampleRate: 1.0,       // monitors performance (adjust to 0.1 in production if needed)
});

// Load environment variables
dotenv.config();

// Import models and routes
const connectDB = require('./utils/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const roomRoutes = require('./routes/rooms');
const User = require('./models/User');
const Message = require('./models/Message');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/)) {
      return cb(new Error('Only image, PDF, or DOC/DOCX files are allowed!'), false);
    }
    cb(null, true);
  },
});
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rooms', roomRoutes);

// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'document';

  res.json({ fileUrl, fileType, fileName: req.file.originalname });
});

// Store connected users
const users = {};

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // --- Authenticate ---
  socket.on('authenticate', async (token) => {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return socket.emit('authentication_error', { message: 'Invalid token' });

      user.socketId = socket.id;
      user.online = true;
      await user.save();

      users[socket.id] = { id: user._id, username: user.username, avatar: user.avatar, socketId: socket.id };
      socket.join('global');

      socket.emit('authenticated', { user: { id: user._id, username: user.username, avatar: user.avatar } });
      io.emit('user_list', Object.values(users));
      io.emit('user_joined', { username: user.username, id: user._id });

      console.log(`${user.username} authenticated and joined the chat`);
    } catch (err) {
      console.error('Authentication error:', err);
      socket.emit('authentication_error', { message: 'Authentication failed' });
    }
  });

  // --- Join room ---
  socket.on('join_room', async (roomName) => {
    try {
      for (const room of socket.rooms) if (room !== socket.id && room !== 'global') socket.leave(room);
      socket.join(roomName);

      const messages = await Message.find({ room: roomName, isPrivate: false })
        .sort({ createdAt: -1 })
        .limit(50)
        .exec();

      socket.emit('room_messages', { room: roomName, messages: messages.reverse() });

      const user = users[socket.id];
      if (user) socket.to(roomName).emit('user_joined_room', { room: roomName, user: { username: user.username, id: user.id } });
    } catch (err) {
      console.error('Error joining room:', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // --- Public message ---
  socket.on('send_message', async (data) => {
    try {
      const user = users[socket.id];
      if (!user) return socket.emit('error', { message: 'Not authenticated' });

      let content = data.content?.trim() || '';
      if (!content && data.fileUrl) content = '📎 File attached';

      const message = new Message({
        senderId: user.id,
        senderName: user.username,
        content,
        room: data.room || 'global',
        isPrivate: false,
        fileUrl: data.fileUrl || '',
        fileType: data.fileType || ''
      });

      await message.save();
      await message.populate('senderId', 'username avatar');

      io.to(message.room).emit('receive_message', message);
    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // --- Private message ---
  socket.on('private_message', async (data) => {
    try {
      const user = users[socket.id];
      if (!user) return socket.emit('error', { message: 'Not authenticated' });

      const recipient = Object.values(users).find(u => u.id.toString() === data.recipientId);
      if (!recipient) return socket.emit('error', { message: 'User is not online' });

      const message = new Message({
        senderId: user.id,
        senderName: user.username,
        content: data.content || '📎 File attached',
        isPrivate: true,
        recipientId: data.recipientId,
        fileUrl: data.fileUrl || '',
        fileType: data.fileType || ''
      });

      await message.save();

      io.to(socket.id).emit('private_message', message);
      io.to(recipient.socketId).emit('private_message', message);
    } catch (err) {
      console.error('Error sending private message:', err);
      socket.emit('error', { message: 'Failed to send private message' });
    }
  });

  // --- Typing indicator ---
  socket.on('typing', ({ room }) => {
    const user = users[socket.id];
    if (!user) return;
    io.to(room || 'global').emit('userTyping', user.username);
  });

  socket.on('stopTyping', ({ room }) => {
    const user = users[socket.id];
    if (!user) return;
    io.to(room || 'global').emit('userStoppedTyping', user.username);
  });

  // --- Disconnect handler ---
  socket.on('disconnect', async () => {
    const user = users[socket.id];
    if (user) {
      console.log(`${user.username} disconnected`);
      try {
        await User.findByIdAndUpdate(user.id, { online: false, socketId: null });
      } catch (err) {
        console.error('Error updating user online status:', err);
      }
      delete users[socket.id];
      io.emit('user_list', Object.values(users));
      io.emit('user_left', { username: user.username, id: user.id });
    }
  });
});

// Root route
app.get('/', (req, res) => res.send('Socket.io Chat Server is running'));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server, io };
