// src/app/api/blog/[id]/route.js

import connectToDatabase from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import mongoose from 'mongoose';
import { bucket } from '@/lib/googleStorage';

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

// Route GET - Récupérer un article par ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const blogPost = await BlogPost.findById(id).populate('categories').exec();

    if (!blogPost) {
      return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
    }

    return NextResponse.json(blogPost, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article :', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Route PUT - Mettre à jour un article par ID
export async function PUT(request, { params }) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;
    const { title, content, author, categories, tags, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

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

    // Récupérer l'ancien article pour supprimer les médias inutilisés si besoin
    const oldPost = await BlogPost.findById(id);
    if (!oldPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Supprimer les médias qui ne sont plus utilisés
    await deleteUnusedMediaFromGCS(oldPost.content, content);

    // Mise à jour de l'article
    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      { title, content, author, categories: categoryIds, tags, status, updatedAt: Date.now() },
      { new: true }
    );

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du post :', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// Route DELETE - Supprimer un article par ID
export async function DELETE(request, { params }) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Récupérer l'article avant de le supprimer pour obtenir les URLs des médias
    const postToDelete = await BlogPost.findById(id);

    if (!postToDelete) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Supprimer les médias associés
    await deleteMediaFromGCS(postToDelete.content);

    // Supprimer l'article de la base de données
    await BlogPost.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Post deleted' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du post :', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

// Fonction pour supprimer les médias du bucket GCS
async function deleteMediaFromGCS(content) {
    try {
      const mediaUrls = [];
      const regex = /https:\/\/storage\.googleapis\.com\/[^"')\s]+/g;
      const contentUrls = content.match(regex);
  
      if (contentUrls) {
        mediaUrls.push(...contentUrls);
      }
  
      for (const url of mediaUrls) {
        const fileName = decodeURIComponent(url.split(`${bucket.name}/`)[1]);
        const file = bucket.file(fileName);
  
        console.log(`Tentative de suppression du fichier : ${fileName}`);
  
        try {
          await file.delete();
          console.log(`Fichier supprimé du bucket GCS : ${fileName}`);
        } catch (error) {
          console.error(`Erreur lors de la suppression de ${fileName} :`, error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des médias du bucket GCS :', error);
    }
  }
  // Fonction pour supprimer les médias qui ne sont plus utilisés
  async function deleteUnusedMediaFromGCS(oldContent, newContent) {
    try {
      const regex = /https:\/\/storage\.googleapis\.com\/[^"')\s]+/g;
      const oldUrls = oldContent.match(regex) || [];
      const newUrls = newContent.match(regex) || [];
  
      // Trouver les URLs qui sont dans l'ancien contenu mais pas dans le nouveau
      const urlsToDelete = oldUrls.filter(url => !newUrls.includes(url));
  
      // Supprimer chaque média du bucket GCS
      for (const url of urlsToDelete) {
        const fileName = url.split(`${bucket.name}/`)[1].replace(/ /g, '%20');
        const file = bucket.file(fileName);
        await file.delete();
        console.log(`Fichier supprimé du bucket GCS : ${fileName}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des médias non utilisés du bucket GCS :', error);
    }
  }