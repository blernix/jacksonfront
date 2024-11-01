'use client';
import { signIn } from 'next-auth/react';

export default function SignIn() {
  return (
    <div>
      <h1>Se connecter</h1>
      <button onClick={() => signIn('google')}>
        Connexion avec Google
      </button>
    </div>
  );
}