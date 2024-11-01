// src/app/api/blog/route.js

import connectToDatabase from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import mongoose from 'mongoose';

// Middleware pour la vérification du token
async function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("Échec de l'authentification : Aucun token fourni.");
    return null;
  }

  const token = authHeader.substring(7); // Supprime 'Bearer '
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    console.log("Token utilisateur validé :", decoded);
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


// Route GET - Récupérer tous les articles
export async function GET(request) {
  try {
    await connectToDatabase();
    const blogPosts = await BlogPost.find().populate('categories').exec();
    return NextResponse.json(blogPosts, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles de blog :', error);
    return NextResponse.json({ error: 'Échec de récupération des articles' }, { status: 500 });
  }
}

// Route POST - Créer un nouvel article
export async function POST(request) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { title, content, author, status, categories, tags } = await request.json();

    // Validation des données
    if (!validator.isLength(title || '', { min: 1 })) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!validator.isLength(content || '', { min: 1 })) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (!validator.isLength(author || '', { min: 1 })) {
      return NextResponse.json({ error: 'Author is required' }, { status: 400 });
    }

    // Gestion des Catégories
    let categoryIds = [];
    if (categories && Array.isArray(categories)) {
      categoryIds = categories.filter(catId => mongoose.Types.ObjectId.isValid(catId));
      const existingCategories = await Category.find({ _id: { $in: categoryIds } }).select('_id').exec();
      categoryIds = existingCategories.map(cat => cat._id);
    }

    // Gestion des Tags
    let tagList = [];
    if (tags && Array.isArray(tags)) {
      tagList = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    const newBlogPost = new BlogPost({ title, content, author, status, categories: categoryIds, tags: tagList });
    const savedPost = await newBlogPost.save();

    return NextResponse.json(savedPost, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du post :', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}