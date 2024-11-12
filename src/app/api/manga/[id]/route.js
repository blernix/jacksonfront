// src/app/api/manga/[id]/route.js

import connectToDatabase from '@/lib/mongodb';
import Manga from '@/models/Manga';
import Chapter from '@/models/Chapter'; // Importer le modèle Chapter
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { deleteMediaFromGCS } from '@/lib/mediaUtils'; // Importer la fonction
import mongoose from 'mongoose';
import { bucket } from '@/lib/googleStorage'; // Assurez-vous que c'est bien importé
import { deleteUnusedMediaFromGCS } from '@/lib/mediaUtils'; // Importer la fonction


// Middleware pour la vérification du token
async function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("Échec de l'authentification : Aucun token fourni.");
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    return decoded;
  } catch (err) {
    console.log("Token invalide :", err);
    return null;
  }
}

// Route OPTIONS
export async function OPTIONS() {
  return new Response(null, {
      status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

// Route GET - Récupérer un manga par ID
export async function GET(request, { params }) {
  await connectToDatabase();
  const { id } = params;

  const manga = await Manga.findById(id);

  if (!manga) {
    return NextResponse.json({ error: 'Manga non trouvé' }, { status: 404 });
  }

  return NextResponse.json(manga, { status: 200 });
}

// Route PUT - Mettre à jour un manga par ID
export async function PUT(request, { params }) {
  const decoded = await verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  const { id } = params;
  const { title, description, author, coverImage } = await request.json();

  // Validation des données
  if (!validator.isLength(title || '', { min: 1 })) {
    return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
  }
  if (!validator.isLength(author || '', { min: 1 })) {
    return NextResponse.json({ error: 'L\'auteur est requis' }, { status: 400 });
  }
  if (!validator.isLength(description || '', { min: 1 })) {
    return NextResponse.json({ error: 'La description est requise' }, { status: 400 });
  }
  if (coverImage && !validator.isURL(coverImage)) {
    return NextResponse.json({ error: 'L\'URL de l\'image de couverture n\'est pas valide' }, { status: 400 });
  }

  // Récupérer l'ancien manga pour gérer la suppression de l'ancienne image
  const oldManga = await Manga.findById(id);
  if (!oldManga) {
    return NextResponse.json({ error: 'Manga non trouvé' }, { status: 404 });
  }

  // Supprimer l'ancienne image de couverture si une nouvelle est fournie
  if (coverImage && oldManga.coverImage && oldManga.coverImage !== coverImage) {
    await deleteMediaFromGCS(oldManga.coverImage);
  }

  const updatedManga = await Manga.findByIdAndUpdate(
    id,
    {
      title,
      description,
      author,
      coverImage,
      updatedAt: Date.now(),
    },
    { new: true }
  );

  if (!updatedManga) {
    return NextResponse.json({ error: 'Manga non trouvé' }, { status: 404 });
  }

  return NextResponse.json(updatedManga, { status: 200 });
}

// Route DELETE - Supprimer un manga par ID avec transactions
export async function DELETE(request, { params }) {
  // Démarrer une session Mongoose
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;

    // Récupérer le manga à supprimer dans la session
    const mangaToDelete = await Manga.findById(id).session(session).exec();

    if (!mangaToDelete) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: 'Manga non trouvé' }, { status: 404 });
    }

    // Récupérer tous les chapitres associés au manga dans la session
    const associatedChapters = await Chapter.find({ manga: id }).session(session).exec();

    // Collecter toutes les URLs des médias à supprimer (couverture + fichiers des chapitres)
    const mediaUrls = [];
    if (mangaToDelete.coverImage) {
      mediaUrls.push(mangaToDelete.coverImage);
    }
    for (const chapter of associatedChapters) {
      if (chapter.files && Array.isArray(chapter.files)) {
        mediaUrls.push(...chapter.files);
      }
    }

    // Supprimer les chapitres de la base de données dans la session
    await Chapter.deleteMany({ manga: id }).session(session).exec();

    // Supprimer le manga de la base de données dans la session
    await Manga.findByIdAndDelete(id).session(session).exec();

    // Valider la transaction
    await session.commitTransaction();
    session.endSession();

    // Supprimer les médias de GCS après la transaction réussie
    for (const url of mediaUrls) {
      await deleteMediaFromGCS(url);
    }

    return NextResponse.json(
      { message: 'Manga et chapitres associés supprimés avec succès' },
      { status: 200 }
    );
  } catch (error) {
    // En cas d'erreur, annuler la transaction
    await session.abortTransaction();
    session.endSession();
    console.error('Erreur lors de la suppression du Manga :', error);
    return NextResponse.json({ error: 'Échec de suppression du Manga' }, { status: 500 });
  }
}