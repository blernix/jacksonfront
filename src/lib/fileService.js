// src/lib/fileService.js

import { bucket } from '@/lib/googleStorage';

// Fonction générique pour sauvegarder les fichiers
export const handleSaveFiles = async (files, contentType) => {
  try {
    const finalFilePaths = [];

    for (let file of files) {
      const tempFilePath = `temp/${contentType}/${file.name}`;
      const finalFilePath = `${contentType}/${file.name}`;
      await moveFileToPermanentLocation(tempFilePath, finalFilePath);
      finalFilePaths.push(finalFilePath);
    }

    return finalFilePaths;
  } catch (error) {
    console.error(`Erreur lors du déplacement des fichiers de type ${contentType}:`, error);
    throw error;
  }
};

// Fonction de déplacement de fichier
export const moveFileToPermanentLocation = async (tempFilePath, finalFilePath) => {
  try {
    const tempFile = bucket.file(tempFilePath);
    await tempFile.move(finalFilePath);
    console.log(`Fichier déplacé de ${tempFilePath} à ${finalFilePath}`);
  } catch (error) {
    console.error(`Erreur lors du déplacement du fichier ${tempFilePath}:`, error);
    throw error;
  }
};