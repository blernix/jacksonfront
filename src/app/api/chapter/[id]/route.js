// src/app/api/chapter/[id]/route.js

import connectToDatabase from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import Manga from '@/models/Manga';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { deleteMediaFromGCS, deleteUnusedMediaFromGCS } from '@/lib/mediaUtils'; // Importer les fonctions


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

// Route GET - Récupérer un chapitre par ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const chapter = await Chapter.findById(id).exec();

    if (!chapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé' }, { status: 404 });
    }

    return NextResponse.json(chapter, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération du Chapitre :', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Route PUT - Mettre à jour un chapitre par ID
export async function PUT(request, { params }) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;
    const { chapterTitle, chapterNumber, files } = await request.json();

    // Récupérer l'ancien chapitre pour gérer la suppression des fichiers
    const oldChapter = await Chapter.findById(id).exec();
    if (!oldChapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé' }, { status: 404 });
    }

    // Validation des données
    const updateData = {};

    if (chapterTitle !== undefined) {
      if (!validator.isLength(chapterTitle || '', { min: 1 })) {
        return NextResponse.json({ error: 'Titre du chapitre ne peut pas être vide' }, { status: 400 });
      }
      updateData.chapterTitle = chapterTitle;
    }

    if (chapterNumber !== undefined) {
      if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
        return NextResponse.json({ error: 'Numéro de chapitre valide est requis' }, { status: 400 });
      }
      updateData.chapterNumber = chapterNumber;
    }

    if (files !== undefined) {
      if (!Array.isArray(files) || files.length === 0) {
        return NextResponse.json({ error: 'Au moins un fichier est requis' }, { status: 400 });
      }
      // Supprimer les fichiers qui ne sont plus présents dans la mise à jour
      await deleteUnusedMediaFromGCS(JSON.stringify(oldChapter.files), JSON.stringify(files));
      updateData.files = files;
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(id, updateData, { new: true }).exec();

    if (!updatedChapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé' }, { status: 404 });
    }

    return NextResponse.json(updatedChapter, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du Chapitre :', error);
    return NextResponse.json({ error: 'Échec de mise à jour du Chapitre' }, { status: 500 });
  }
}

// Route DELETE - Supprimer un chapitre par ID
export async function DELETE(request, { params }) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;

    // Récupérer le chapitre à supprimer
    const chapterToDelete = await Chapter.findById(id).exec();

    if (!chapterToDelete) {
      return NextResponse.json({ error: 'Chapitre non trouvé' }, { status: 404 });
    }

    // Supprimer les fichiers associés du bucket GCS
    if (chapterToDelete.files && Array.isArray(chapterToDelete.files)) {
      for (const fileUrl of chapterToDelete.files) {
        await deleteMediaFromGCS(fileUrl);
      }
    }

    // Supprimer le chapitre de la base de données
    await Chapter.findByIdAndDelete(id).exec();

    // Retirer le chapitre de la liste des chapitres du Manga
    await Manga.findByIdAndUpdate(
      chapterToDelete.manga,
      { $pull: { chapters: chapterToDelete._id } },
      { new: true }
    ).exec();

    return NextResponse.json({ message: 'Chapitre supprimé avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du Chapitre :', error);
    return NextResponse.json({ error: 'Échec de suppression du Chapitre' }, { status: 500 });
  }
}