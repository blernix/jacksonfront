"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from './footer/Footer';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';

const HomePage = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentMangas, setRecentMangas] = useState([]);

  useEffect(() => {
    // Récupération des articles de blog et mangas les plus récents (3 articles et 2 mangas)
    const fetchContent = async () => {
      try {
        const postsResponse = await axios.get('/api/blog?limit=3'); // Limite à 3 articles
        const mangasResponse = await axios.get('/api/manga?limit=2'); // Limite à 2 mangas
        setRecentPosts(postsResponse.data.slice(0, 3)); // Assure l’affichage de 3 éléments maximum
        setRecentMangas(mangasResponse.data.slice(0, 2)); // Assure l’affichage de 2 éléments maximum
      } catch (error) {
        console.error("Erreur lors de la récupération des contenus :", error);
      }
    };

    fetchContent();
  }, []);

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 8, minHeight: '100vh' }}>
        
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
            borderRadius: 4,
            color: '#ffffff',
            mb: 10,
          }}
        >
          <Typography variant="h3" gutterBottom>
            Bienvenue dans notre Univers
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Explorez des histoires fascinantes et plongez dans le monde des mangas et du blogging.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              mr: 2,
              px: 4,
              py: 1,
              fontSize: '1rem',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
            component={Link}
            href="/blog"
          >
            Explorez le Blog
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            sx={{
              px: 4,
              py: 1,
              fontSize: '1rem',
              color: '#ffffff',
              borderColor: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: '#ffffff',
              },
            }}
            component={Link}
            href="/manga"
          >
            Découvrez les Mangas
          </Button>
        </Box>

        {/* Section des Articles de Blog Récents */}
        <Typography variant="h4" component="h2" gutterBottom sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          position: 'relative',
          mb: 4,
          '&::after': {
            content: '""',
            display: 'block',
            width: '60px',
            height: '4px',
            backgroundColor: '#1976d2',
            margin: '8px auto 0',
            borderRadius: '2px',
          },
        }}>
          Articles de Blog Récents
        </Typography>
        <Grid container spacing={4} mb={8}>
          {recentPosts.map((post) => (
            <Grid item key={post._id} xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link href={`/blog/${post._id}`} passHref>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: 3,
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6,
                      },
                      cursor: 'pointer',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {post.imageUrl && (
                      <CardMedia
                        component="img"
                        height="180"
                        image={post.imageUrl}
                        alt={post.title}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="h2"
                        sx={{ color: '#1976d2', fontWeight: 'bold' }}
                      >
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {DOMPurify.sanitize(post.content).replace(/<[^>]*>?/gm, '').slice(0, 100)}...
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Section des Mangas Récents */}
        <Typography variant="h4" component="h2" gutterBottom sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          position: 'relative',
          mb: 4,
          '&::after': {
            content: '""',
            display: 'block',
            width: '60px',
            height: '4px',
            backgroundColor: '#1976d2',
            margin: '8px auto 0',
            borderRadius: '2px',
          },
        }}>
          Mangas Récents
        </Typography>
        <Grid container spacing={4} mb={8}>
          {recentMangas.map((manga) => (
            <Grid item key={manga._id} xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link href={`/manga/${manga._id}`} passHref>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: 3,
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6,
                      },
                      cursor: 'pointer',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {manga.coverImage && (
                      <CardMedia
                        component="img"
                        height="180"
                        image={manga.coverImage}
                        alt={manga.title}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="h2"
                        sx={{ color: '#1976d2', fontWeight: 'bold' }}
                      >
                        {manga.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {DOMPurify.sanitize(manga.description).replace(/<[^>]*>?/gm, '').slice(0, 100)}...
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Footer />
    </>
  );
};

export default HomePage;