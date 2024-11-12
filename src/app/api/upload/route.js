import { NextResponse } from 'next/server';
import { bucket } from '@/lib/googleStorage';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'blog'; // 'blog', 'manga', ou autre

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier téléchargé' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    let blob = Buffer.from(buffer);

    // Initialiser contentType avec le type MIME original
    let contentType = file.type;

    // Vérifier le type de fichier
    const mimeType = file.type;

    if (mimeType.startsWith('image/')) {
      try {
        // Utiliser sharp pour compresser l'image
        const image = sharp(blob);

        // Récupérer les métadonnées pour déterminer le format
        const metadata = await image.metadata();

        // Appliquer la compression en fonction du format
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
          blob = await image
            .jpeg({
              quality: 80, // Ajustez la qualité selon vos besoins (0-100)
              mozjpeg: true,
            })
            .toBuffer();
          contentType = 'image/jpeg';
        } else if (metadata.format === 'png') {
          blob = await image
            .png({
              compressionLevel: 8, // Niveau de compression (0-9)
              adaptiveFiltering: true,
            })
            .toBuffer();
          contentType = 'image/png';
        } else if (metadata.format === 'webp') {
          blob = await image
            .webp({
              quality: 80,
            })
            .toBuffer();
          contentType = 'image/webp';
        } else {
          // Si le format n'est pas pris en charge, le convertir en JPEG
          blob = await image.jpeg({ quality: 80 }).toBuffer();
          contentType = 'image/jpeg';
        }
      } catch (compressionError) {
        console.error('Erreur lors de la compression de l\'image :', compressionError);
        return NextResponse.json({ error: 'Erreur lors de la compression de l\'image' }, { status: 500 });
      }
    } else if (mimeType === 'application/pdf') {
      // Gérer les fichiers PDF sans modification
      console.log('Fichier PDF détecté. Aucun traitement supplémentaire requis.');
    } else {
      // Gérer les autres types de fichiers si nécessaire
      return NextResponse.json({ error: 'Type de fichier non pris en charge' }, { status: 400 });
    }

    // Nettoyage du nom de fichier
    const originalFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${uuidv4()}_${originalFileName}`;

    // Définir le dossier de destination en fonction du type
    console.log("Type de fichier:", type);
    const destination = `${type}/${fileName}`;
    const blobFile = bucket.file(destination);

    await blobFile.save(blob, {
      resumable: false,
      contentType: contentType, // Utiliser contentType ici
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blobFile.name}`;

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier :', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload du fichier' }, { status: 500 });
  }
}