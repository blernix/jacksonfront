// src/models/Chapter.js

import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema(
  {
    chapterTitle: {
      type: String,
      required: true,
      trim: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    files: [
      {
        type: String, // URLs des fichiers PDF ou images
        required: true,
      },
    ],
    manga: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manga',
      required: true,
    },
  },
  { timestamps: true }
);

// Index pour assurer l'unicité du numéro de chapitre par manga
ChapterSchema.index({ manga: 1, chapterNumber: 1 }, { unique: true });

const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);

export default Chapter;