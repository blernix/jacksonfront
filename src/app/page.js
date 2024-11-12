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
  Skeleton,
} from '@mui/material';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';

const HomePage = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentMangas, setRecentMangas] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMangas, setLoadingMangas] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const postsResponse = await axios.get('/api/blog?limit=3');
        const mangasResponse = await axios.get('/api/manga?limit=2');
        setRecentPosts(postsResponse.data.slice(0, 3));
        setRecentMangas(mangasResponse.data.slice(0, 2));
      } catch (error) {
        console.error("Erreur lors de la récupération des contenus :", error);
      } finally {
        setLoadingPosts(false);
        setLoadingMangas(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 8, minHeight: '100vh', color: '#d9d9d9' }}>
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            background: 'linear-gradient(135deg, #333333 0%, #1a1a1a 100%)',
            borderRadius: 4,
            color: '#ffffff',
            mb: 10,
            boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Bienvenue dans notre Univers
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, color: '#b3b3b3' }}>
            Explorez des histoires fascinantes et plongez dans le monde des mangas et du blogging.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              mr: 2,
              px: 4,
              py: 1,
              fontSize: '1rem',
              backgroundColor: '#0077b6',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#005f87',
              },
            }}
            component={Link}
            href="/blog"
          >
            Explorez le Blog
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              px: 4,
              py: 1,
              fontSize: '1rem',
              color: '#0077b6',
              borderColor: '#0077b6',
              '&:hover': {
                backgroundColor: 'rgba(0, 119, 182, 0.1)',
                borderColor: '#005f87',
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
          color: '#d9d9d9',
          '&::after': {
            content: '""',
            display: 'block',
            width: '60px',
            height: '4px',
            backgroundColor: '#0077b6',
            margin: '8px auto 0',
            borderRadius: '2px',
          },
        }}>
          Articles de Blog Récents
        </Typography>
        <Grid container spacing={4} mb={8}>
          {loadingPosts
            ? Array.from({ length: 3 }).map((_, index) => (
                <Grid item key={index} xs={12} sm={6} md={4}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, bgcolor: '#333333' }} />
                  <Skeleton variant="text" sx={{ bgcolor: '#4a4a4a', my: 1 }} />
                  <Skeleton variant="text" width="60%" sx={{ bgcolor: '#4a4a4a' }} />
                </Grid>
              ))
            : recentPosts.map((post) => (
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
                          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)',
                          transition: 'transform 0.3s',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0px 10px 20px rgba(0, 119, 182, 0.4)',
                          },
                          cursor: 'pointer',
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
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
                            sx={{ color: '#0077b6', fontWeight: 'bold' }}
                          >
                            {post.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
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
          color: '#d9d9d9',
          '&::after': {
            content: '""',
            display: 'block',
            width: '60px',
            height: '4px',
            backgroundColor: '#0077b6',
            margin: '8px auto 0',
            borderRadius: '2px',
          },
        }}>
          Mangas Récents
        </Typography>
        <Grid container spacing={4} mb={8}>
          {loadingMangas
            ? Array.from({ length: 2 }).map((_, index) => (
                <Grid item key={index} xs={12} sm={6} md={4}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, bgcolor: '#333333' }} />
                  <Skeleton variant="text" sx={{ bgcolor: '#4a4a4a', my: 1 }} />
                  <Skeleton variant="text" width="60%" sx={{ bgcolor: '#4a4a4a' }} />
                </Grid>
              ))
            : recentMangas.map((manga) => (
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
                          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)',
                          transition: 'transform 0.3s',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0px 10px 20px rgba(0, 119, 182, 0.4)',
                          },
                          cursor: 'pointer',
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
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
                            sx={{ color: '#0077b6', fontWeight: 'bold' }}
                          >
                            {manga.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
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