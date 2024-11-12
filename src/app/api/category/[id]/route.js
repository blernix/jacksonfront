// src/app/api/category/[id]/route.js
  
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import jwt from 'jsonwebtoken';
import BlogPost from '@/models/BlogPost';

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

// Récupérer une catégorie spécifique
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const category = await Category.findById(params.id).exec();
    if (!category) {
      return new Response(JSON.stringify({ error: 'Catégorie non trouvée.' }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(category), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Échec de récupération de la catégorie' }), {
      status: 500,
    });
  }
}

// Mettre à jour une catégorie spécifique
export async function PUT(request, { params }) {
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
      return new Response(JSON.stringify({ error: 'Le titre est requis.' }), {
        status: 400,
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      params.id,
      { title: title.trim() },
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
    return new Response(JSON.stringify({ error: 'Échec de mise à jour de la catégorie' }), {
      status: 500,
    });
  }
}

// Supprimer une catégorie spécifique
export async function DELETE(request, { params }) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    await connectToDatabase();
    const blogPostUsingCategory = await BlogPost.findOne({ categories: params.id }).exec();
    if (blogPostUsingCategory) {
      return new Response(JSON.stringify({ error: 'Impossible de supprimer cette catégorie car elle est utilisée dans un article.' }), {
        status: 400,
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(params.id).exec();

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
    return new Response(JSON.stringify({ error: 'Échec de suppression de la catégorie' }), {
      status: 500,
    });
  }
}