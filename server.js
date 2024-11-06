// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Environment configuration
const PORT = process.env.PORT || 5000;
const DB_URI = 'mongodb://127.0.0.1:27017/blog';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/user', require('./Routes/Authentication'));
app.use('/api/posts', require('./Controller/postController'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
