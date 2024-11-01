import { NextResponse } from 'next/server';

export function middleware(req) {
  const response = NextResponse.next();

  // Appliquer les en-têtes CORS uniquement pour les requêtes API
  if (req.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8100');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};