// src/models/Manga.js

import mongoose from 'mongoose';

const MangaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String, // URL de l'image de couverture
      required: true,
    },
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
      },
    ],
  },
  { timestamps: true }
);

const Manga = mongoose.models.Manga || mongoose.model('Manga', MangaSchema);

export default Manga;