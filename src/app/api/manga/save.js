// src/pages/api/manga/save.js

import { handleSaveFiles } from '@/lib/fileService';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { coverImage, ...mangaData } = req.body;

    try {
      const finalFilePaths = await handleSaveFiles([coverImage], 'manga-cover');

      const savedManga = await saveManga({
        ...mangaData,
        coverImage: finalFilePaths[0], // La couverture a une seule image
      });

      res.status(200).json(savedManga);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du manga:", error);
      res.status(500).json({ error: "Erreur lors de la sauvegarde du manga" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}