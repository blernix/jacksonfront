// src/utils/authUtils.js

import jwt from 'jsonwebtoken';

/**
 * Fonction de vérification du token JWT
 * @param {Request} request - Requête HTTP contenant le token dans l'en-tête Authorization
 * @returns {Object|null} - Les informations décodées du token ou null si le token est invalide
 */
export async function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("Échec de l'authentification : Aucun token fourni.");
    return null;
  }

  const token = authHeader.substring(7); // Retire "Bearer " du token
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET); // Décode le token avec le secret
    return decoded;
  } catch (err) {
    console.log("Token invalide :", err);
    return null;
  }
}