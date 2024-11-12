// src/pages/api/blog/save.js

import { handleSaveFiles } from '@/lib/fileService';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content, files, ...articleData } = req.body;

    try {
      const finalFilePaths = await handleSaveFiles(files, 'blog');

      const savedArticle = await saveArticle({
        ...articleData,
        content,
        images: finalFilePaths,
      });

      res.status(200).json(savedArticle);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'article:", error);
      res.status(500).json({ error: "Erreur lors de la sauvegarde de l'article" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}