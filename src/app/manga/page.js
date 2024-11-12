'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Skeleton,
  Typography,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import Navbar from '@/components/Navbar';
import Footer from '../footer/Footer';

const MangaPage = () => {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const response = await axios.get('/api/manga');
        setMangas(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des mangas :', error);
        setError('Erreur lors de la récupération des mangas.');
      } finally {
        setLoading(false);
      }
    };

    fetchMangas();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, py: 8, backgroundColor: 'transparent', minHeight: '100vh' }}>
        
        {/* En-tête de la page */}
        <Box textAlign="center" mb={8}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
            Bibliothèque de Mangas
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ color: '#d1d1d1' }}>
            Explorez les œuvres de votre artiste préféré.
          </Typography>
        </Box>

        {/* Liste des mangas */}
        <Grid container spacing={6}>
          {loading ? (
            // Skeleton Loading avec couleur de fond visible
            Array.from({ length: 6 }).map((_, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <Skeleton
                  variant="rectangular"
                  height={200}
                  sx={{
                    borderRadius: 2,
                    animation: 'wave',
                    bgcolor: '#333333' // Couleur de fond visible sur le fond noir
                  }}
                />
                <Skeleton variant="text" sx={{ bgcolor: '#4a4a4a', my: 1 }} />
                <Skeleton variant="text" width="60%" sx={{ bgcolor: '#4a4a4a' }} />
              </Grid>
            ))
          ) : (
            mangas.map((manga) => (
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
                        backgroundColor: '#1c1c1c', // Fond sombre du card
                      }}
                    >
                      {/* Image de couverture du manga */}
                      {manga.coverImage && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={manga.coverImage}
                          alt={manga.title}
                          sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                        />
                      )}

                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="h2"
                          sx={{ color: '#f3f3f3', fontWeight: 'bold' }}
                        >
                          {manga.title}
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2, color: '#bdbdbd' }}>
                          Par {manga.author}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              manga.description.length > 150
                                ? `${manga.description.substring(0, 150)}...`
                                : manga.description
                            ),
                          }}
                          sx={{ color: '#bdbdbd' }}
                        />
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button variant="contained" color="primary" fullWidth href={`/manga/${manga._id}`}>
                          Voir les Chapitres
                        </Button>
                      </Box>
                    </Card>
                  </Link>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>

        {/* Loader supplémentaire si nécessaire */}
        {loading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {/* Footer */}
       
      </Container>
      <Footer />
    </>
  );
};

export default MangaPage;