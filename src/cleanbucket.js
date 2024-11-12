// src/cleanbucket.js

const { bucket } = require('./lib/googleStorage'); // Utilisez un chemin relatif ici

const cleanTemporaryBucketFiles = async () => {
  try {
    const [files] = await bucket.getFiles({ prefix: 'temp/' });
    for (const file of files) {
      await file.delete();
      console.log(`Fichier supprimé : ${file.name}`);
    }
    console.log("Tous les fichiers temporaires ont été supprimés.");
  } catch (error) {
    console.error("Erreur lors de la suppression des fichiers temporaires :", error);
  }
};

cleanTemporaryBucketFiles();