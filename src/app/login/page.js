// pages/login.js
'use client';
import { signIn } from 'next-auth/react';
import { Box, Button, Typography, Container } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginPage() {
  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <Box
        sx={{
          width: '100%',
          padding: 4,
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          borderRadius: 4,
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Connexion à l'administration
        </Typography>
        <Typography variant="body1" sx={{ color: '#b3b3b3', mb: 4 }}>
          Veuillez vous connecter avec votre compte Google pour accéder à la zone d'administration.
        </Typography>
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={() => signIn('google', { callbackUrl: '/admin' })}
          sx={{
            width: '100%',
            padding: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor: '#4285f4',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#357ae8',
            },
          }}
        >
          Se connecter avec Google
        </Button>
      </Box>
    </Container>
  );
}