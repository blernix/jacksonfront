// src/app/api/category/route.js

import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import jwt from 'jsonwebtoken';

async function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

// Route GET - Récupérer toutes les catégories avec le nombre d'articles associés
export async function GET(request) {
  try {
    await connectToDatabase();

    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'blogposts', // Nom de la collection des articles
          localField: '_id',
          foreignField: 'categories',
          as: 'articles',
        },
      },
      {
        $addFields: {
          articleCount: { $size: '$articles' },
        },
      },
      {
        $project: {
          articles: 0, // Exclure les articles pour ne garder que le nombre
        },
      },
    ]);

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories :', error);
    return new Response(JSON.stringify({ error: 'Échec de récupération des catégories' }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    await connectToDatabase();
    const { title } = await request.json();

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return new Response(JSON.stringify({ error: 'Le titre de la catégorie est requis.' }), {
        status: 400,
      });
    }

    const newCategory = new Category({ title: title.trim() });
    const savedCategory = await newCategory.save();

    return new Response(JSON.stringify(savedCategory), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Échec de création de la catégorie' }), {
      status: 500,
    });
  }
}