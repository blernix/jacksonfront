// /pages/api/category/route.js

import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import jwt from 'jsonwebtoken';
import BlogPost from '@/models/BlogPost';

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

// Route GET - Récupérer toutes les catégories
export async function GET(request) {
  try {
    await connectToDatabase();
    const categories = await Category.find().exec();
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

// Route POST - Créer une nouvelle catégorie
export async function POST(request) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    await connectToDatabase();
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return new Response(JSON.stringify({ error: 'Le nom de la catégorie est requis.' }), {
        status: 400,
      });
    }

    // Vérifier si la catégorie existe déjà
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return new Response(JSON.stringify({ error: 'La catégorie existe déjà.' }), {
        status: 400,
      });
    }

    const newCategory = new Category({ name: name.trim() });
    const savedCategory = await newCategory.save();

    return new Response(JSON.stringify(savedCategory), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie :', error);
    return new Response(JSON.stringify({ error: 'Échec de création de la catégorie' }), {
      status: 500,
    });
  }
}

// Route PUT - Mettre à jour une catégorie
export async function PUT(request) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    await connectToDatabase();
    const { _id, name } = await request.json();

    if (!_id || !name || typeof name !== 'string' || name.trim() === '') {
      return new Response(JSON.stringify({ error: 'ID et nom de la catégorie sont requis.' }), {
        status: 400,
      });
    }

    // Vérifier si une autre catégorie avec le même nom existe
    const existingCategory = await Category.findOne({ name: name.trim(), _id: { $ne: _id } });
    if (existingCategory) {
      return new Response(JSON.stringify({ error: 'Une autre catégorie avec ce nom existe déjà.' }), {
        status: 400,
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      _id,
      { name: name.trim() },
      { new: true }
    ).exec();

    if (!updatedCategory) {
      return new Response(JSON.stringify({ error: 'Catégorie non trouvée.' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(updatedCategory), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie :', error);
    return new Response(JSON.stringify({ error: 'Échec de mise à jour de la catégorie' }), {
      status: 500,
    });
  }
}

// Route DELETE - Supprimer une catégorie
export async function DELETE(request) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    await connectToDatabase();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID est requis.' }), { status: 400 });
    }

    // Vérifier si la catégorie est utilisée dans un article
    const blogPostUsingCategory = await BlogPost.findOne({ categories: id }).exec();
    if (blogPostUsingCategory) {
      return new Response(JSON.stringify({ error: 'Impossible de supprimer cette catégorie car elle est utilisée dans un article.' }), {
        status: 400,
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id).exec();

    if (!deletedCategory) {
      return new Response(JSON.stringify({ error: 'Catégorie non trouvée.' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Catégorie supprimée avec succès.' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie :', error);
    return new Response(JSON.stringify({ error: 'Échec de suppression de la catégorie' }), {
      status: 500,
    });
  }
}