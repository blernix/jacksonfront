// src/pages/api/chapter/save.js

import { handleSaveFiles } from '@/lib/fileService';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { chapterTitle, chapterNumber, files, mangaId } = req.body;

    try {
      const finalFilePaths = await handleSaveFiles(files, 'chapter-manga');

      const savedChapter = await saveChapter({
        chapterTitle,
        chapterNumber,
        files: finalFilePaths,
        manga: mangaId,
      });

      res.status(200).json(savedChapter);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du chapitre:", error);
      res.status(500).json({ error: "Erreur lors de la sauvegarde du chapitre" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}