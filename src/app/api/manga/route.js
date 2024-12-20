// src/app/api/manga/route.js

import connectToDatabase from '@/lib/mongodb';
import Manga from '@/models/Manga';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

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

// Route GET racine - Récupérer tous les mangas avec le nombre de chapitres associés
export async function GET(request) {
  try {
    await connectToDatabase();

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
    console.error('Erreur lors de la récupération des Mangas :', error);
    return NextResponse.json({ error: 'Échec de récupération des Mangas' }, { status: 500 });
  }
}

// Route POST - Créer un nouveau manga
export async function POST(request) {
  const decoded = await verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

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

  const newManga = new Manga({
    title,
    description,
    author,
    coverImage,
  });

  const savedManga = await newManga.save();

  return NextResponse.json(savedManga, { status: 201 });
}