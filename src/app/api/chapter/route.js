// src/app/api/chapter/route.js

import connectToDatabase from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import Manga from '@/models/Manga';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

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
      'Access-Control-Allow-Origin': 'http://localhost:8100',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

// Route GET - Récupérer tous les chapitres pour un manga donné
export async function GET(request) {
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const mangaId = url.searchParams.get('mangaId');

    if (!mangaId || !mongoose.Types.ObjectId.isValid(mangaId)) {
      return NextResponse.json({ error: 'Manga ID valide est requis' }, { status: 400 });
    }

    const chapters = await Chapter.find({ manga: mangaId }).exec();

    return NextResponse.json(chapters, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des Chapitres :', error);
    return NextResponse.json({ error: 'Échec de récupération des Chapitres' }, { status: 500 });
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