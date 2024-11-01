// models/BlogPost.js

import mongoose from 'mongoose';

const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: function() { return this.status === 'published'; },
  },
  content: {
    type: String,
    required: function() { return this.status === 'published'; },
  },
  author: {
    type: String,
    required: function() { return this.status === 'published'; },
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Référence vers le modèle Category
    }
  ],
  tags: [
    {
      type: String,
    }
  ],
}, { collection: 'blogposts' });

// Met à jour `updatedAt` avant chaque sauvegarde (utile pour l'auto-save)
BlogPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema, 'blogposts');
export default BlogPost;