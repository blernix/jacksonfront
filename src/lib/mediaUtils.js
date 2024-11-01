// src/lib/mediaUtils.js
import { bucket } from '@/lib/googleStorage';

/**
 * Supprime une image du bucket GCS en fonction de son URL.
 * @param {string} url - L'URL de l'image à supprimer.
 */
export async function deleteMediaFromGCS(url) {
  try {
    const fileName = decodeURIComponent(url.split(`${bucket.name}/`)[1]);
    const file = bucket.file(fileName);

    console.log(`Tentative de suppression du fichier : ${fileName}`);

    await file.delete();
    console.log(`Fichier supprimé du bucket GCS : ${fileName}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression de ${url} :`, error);
  }
}

/**
 * Supprime les médias non utilisés entre l'ancien et le nouveau contenu.
 * @param {string} oldContent - Ancien contenu contenant les URLs des médias.
 * @param {string} newContent - Nouveau contenu contenant les URLs des médias.
 */
export async function deleteUnusedMediaFromGCS(oldContent, newContent) {
  try {
    const regex = /https:\/\/storage\.googleapis\.com\/[^"')\s]+/g;
    const oldUrls = oldContent.match(regex) || [];
    const newUrls = newContent.match(regex) || [];

    // URLs à supprimer : présentes dans oldUrls mais pas dans newUrls
    const urlsToDelete = oldUrls.filter(url => !newUrls.includes(url));

    for (const url of urlsToDelete) {
      await deleteMediaFromGCS(url);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression des médias non utilisés du bucket GCS :', error);
  }
}