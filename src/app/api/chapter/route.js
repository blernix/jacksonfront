// src/app/api/chapter/route.js

import connectToDatabase from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import Manga from '@/models/Manga';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/authUtils'; // Utilisation d'un module utilitaire pour la vérification de token

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

// Route GET - Récupérer les chapitres d’un manga spécifique ou tous les mangas avec leur nombre de chapitres
export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Récupère le paramètre mangaId s’il est fourni dans la requête
    const url = new URL(request.url);
    const mangaId = url.searchParams.get('mangaId');

    if (mangaId) {
      // Vérifie si le mangaId est valide
      if (!mongoose.Types.ObjectId.isValid(mangaId)) {
        return NextResponse.json({ error: 'Manga ID invalide' }, { status: 400 });
      }

      // Retourne les chapitres associés au mangaId
      const chapters = await Chapter.find({ manga: mangaId }).exec();
      return NextResponse.json(chapters, { status: 200 });
    }

    // Si aucun mangaId n’est fourni, retourne tous les mangas avec le nombre de chapitres associés
    const mangas = await Manga.aggregate([
      {
        $lookup: {
          from: 'chapters', // Nom de la collection de chapitres
          localField: '_id',
          foreignField: 'manga',
          as: 'chapters',
        },
      },
      {
        $addFields: {
          chapterCount: { $size: '$chapters' }, // Ajoute le nombre de chapitres
        },
      },
      {
        $project: {
          chapters: 0, // Exclut les chapitres eux-mêmes du résultat pour alléger la réponse
        },
      },
    ]);

    return NextResponse.json(mangas, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des Mangas ou Chapitres :', error);
    return NextResponse.json({ error: 'Échec de récupération des données' }, { status: 500 });
  }
}

// Route POST - Créer un nouveau chapitre
export async function POST(request) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { mangaId, chapterTitle, chapterNumber, files } = await request.json();

    // Validation des données
    if (!mangaId || !mongoose.Types.ObjectId.isValid(mangaId)) {
      return NextResponse.json({ error: 'Manga ID valide est requis' }, { status: 400 });
    }
    if (!validator.isLength(chapterTitle || '', { min: 1 })) {
      return NextResponse.json({ error: 'Titre du chapitre est requis' }, { status: 400 });
    }
    if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
      return NextResponse.json({ error: 'Numéro de chapitre valide est requis' }, { status: 400 });
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'Au moins un fichier est requis' }, { status: 400 });
    }

    // Vérifier que le Manga existe
    const manga = await Manga.findById(mangaId).exec();
    if (!manga) {
      return NextResponse.json({ error: 'Manga non trouvé' }, { status: 404 });
    }

    // Vérifier que le numéro de chapitre est unique pour ce Manga
    const existingChapter = await Chapter.findOne({ manga: mangaId, chapterNumber }).exec();
    if (existingChapter) {
      return NextResponse.json({ error: 'Un chapitre avec ce numéro existe déjà pour ce Manga' }, { status: 400 });
    }

    // Création du Chapitre
    const newChapter = new Chapter({
      chapterTitle,
      chapterNumber,
      files,
      manga: mangaId,
    });

    const savedChapter = await newChapter.save();

    // Ajouter le chapitre au Manga
    manga.chapters.push(savedChapter._id);
    await manga.save();

    return NextResponse.json(savedChapter, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du Chapitre :', error);
    return NextResponse.json({ error: 'Échec de création du Chapitre' }, { status: 500 });
  }
}