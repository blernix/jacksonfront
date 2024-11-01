import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const collections = await db.listCollections().toArray();

    return new Response(JSON.stringify({ message: 'Connexion réussie', collections }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion à MongoDB:', error);
    return new Response(JSON.stringify({ message: 'Erreur lors de la connexion à MongoDB' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}