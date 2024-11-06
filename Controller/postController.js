const express = require('express');
const jwt = require('jsonwebtoken');
const Post = require('../Model/Post');
const router = express.Router();

// Middleware for authentication
const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'secret');
    req.userId = decoded.id;  // Store user ID from token in req.userId
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Create a post
router.post('/', auth, async (req, res) => {
  const { title, content, email } = req.body;
  const post = new Post({ title, content, author: req.userId }); // Ensure `author` is `userId` for security
  await post.save();
  res.status(201).json(post);
});

// Get all posts
router.get('/', async (req, res) => {
  const posts = await Post.find().populate('author', 'username');
  res.json(posts);
});

// Get posts specific to authenticated user
router.get('/filter', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.userId });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a post
router.put('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', '_id');;
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (post.author.toString() !== req.userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  Object.assign(post, req.body);
  await post.save();
  res.json(post);
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
