// src/app/api/blog/recommended/route.js
import connectToDatabase from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request) {
  await connectToDatabase();

  // Récupérer les paramètres de la requête
  const url = new URL(request.url);
  const tags = url.searchParams.get('tags')?.split(',') || [];
  const category = url.searchParams.get('category') || '';
  const currentId = url.searchParams.get('currentId');

  try {
    // Initialiser le filtre avec l'exclusion de l'article actuel
    const filter = {
      _id: { $ne: currentId },
      $or: [],
    };

    // Vérifier les tags
    if (tags.length > 0) {
      filter.$or.push({ tags: { $in: tags } });
    }

    // Vérifier si `category` est un ObjectId valide et l'ajouter au filtre
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.$or.push({ categories: category });
    }

    // Si le filtre $or est vide, retourner un tableau vide
    if (filter.$or.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Récupérer les articles similaires
    const similarArticles = await BlogPost.find(filter)
      .limit(3)
      .exec();

    return NextResponse.json(similarArticles, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles similaires:', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération des articles similaires' }, { status: 500 });
  }
}