"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '../footer/Footer';
import {
  Skeleton,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Container,
  Snackbar,
  Alert,
  Grid,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/blog');
        setPosts(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des articles de blog :', error);
        showNotification('Erreur lors de la récupération des articles de blog.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, py: 8, backgroundColor: 'transparent', minHeight: '100vh' }}>
        
        {/* En-tête de la page */}
        <Box textAlign="center" mb={8}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
            Bienvenue sur le Blog
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: '#b3b3b3' }}>
            Explorons le monde, l&apos;acceptation et l&apos;inclusivité ensemble.
          </Typography>
          
 {/* Barre de recherche */}
<TextField
  variant="outlined"
  placeholder="Rechercher un article..."
  onChange={handleSearch}
  sx={{
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    backgroundColor: '#333333',
    borderRadius: 6,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'transparent',
      },
      '&:hover fieldset': {
        borderColor: 'transparent',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'transparent',
      },
      '& input': {
        color: '#ffffff',
      },
      '&.Mui-focused': {
        outline: 'none', // Supprime la bordure bleue de focus
      },
    },
  }}
/>
        </Box>

        <Grid container spacing={4} mb={8}>
  {loading ? (
    Array.from({ length: 6 }).map((_, index) => (
      <Grid item key={index} xs={12} sm={6} md={4}>
        <Skeleton
          variant="rectangular"
          height={200}
          sx={{
            borderRadius: 2,
            animation: 'wave',
            bgcolor: '#333333',
          }}
        />
        <Skeleton variant="text" sx={{ bgcolor: '#4a4a4a', my: 1 }} />
        <Skeleton variant="text" width="60%" sx={{ bgcolor: '#4a4a4a' }} />
      </Grid>
    ))
  ) : filteredPosts.length === 0 ? (
    <Box textAlign="center" width="100%" mt={4}>
      <Typography variant="h6" color="textSecondary" sx={{ color: '#b3b3b3' }}>
        Aucun article trouvé.
      </Typography>
    </Box>
  ) : (
    filteredPosts.map((post) => (
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
                transition: 'transform 0.3s, box-shadow 0.3s',
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
                  height="200"
                  image={post.imageUrl}
                  alt={post.title}
                  sx={{
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
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
                <Typography variant="subtitle2" sx={{ color: '#b3b3b3', mb: 2 }}>
                  Par {post.author} | {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                  {DOMPurify.sanitize(post.content).replace(/<[^>]*>?/gm, '').slice(0, 150)}...
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#0077b6',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#005f87',
                    },
                  }}
                >
                  Lire la suite
                </Button>
              </Box>
            </Card>
          </Link>
        </motion.div>
      </Grid>
    ))
  )}
</Grid>

        {loading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress sx={{ color: '#0077b6' }} />
          </Box>
        )}

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            sx={{
              width: '100%',
              borderRadius: '12px',
              boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.2)',
              backgroundColor: '#2e2e2e',
              color: '#ffffff',
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
      <Footer />
    </>
  );
};

export default BlogPage;