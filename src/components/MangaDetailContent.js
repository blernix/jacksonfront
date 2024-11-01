"use client";

import { useState } from 'react';
import { Typography, Grid, Box, Card, CardContent, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import sanitizeHtml from 'sanitize-html';

const MangaDetailContent = ({ manga, chapters }) => {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <>
      {/* Manga Information */}
      <Box mb={4} textAlign="center" position="relative">
        <Typography variant="h3" component="h1" gutterBottom>
          {manga.title}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Par {manga.author}
        </Typography>

        <Box position="relative" display="inline-block">
          {manga.coverImage && (
            <img
              src={manga.coverImage}
              alt={manga.title}
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginTop: '16px' }}
            />
          )}
          
          {/* Button to reveal description */}
          <IconButton
            onClick={() => setShowDescription(!showDescription)}
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#fff',
              zIndex: 2, // Ensure the button stays above other elements
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
            }}
          >
            {showDescription ? <CloseIcon /> : <AddIcon />}
          </IconButton>

          {/* Description Overlay */}
          {showDescription && (
            <Box
              position="absolute"
              bottom={0}
              width="100%"
              maxHeight="60%" // Limit the height of the description
              bgcolor="rgba(0, 0, 0, 0.7)"
              color="#fff"
              p={2}
              sx={{
                borderRadius: '0 0 8px 8px',
                overflowY: 'auto', // Enable scroll if content is too large
                transition: 'opacity 0.3s ease-in-out',
              }}
            >
              <Typography
                variant="body1"
                color="inherit"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(manga.description) }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Chapters */}
      <Box mt={6}>
        <Typography variant="h4" gutterBottom>
          Chapitres
        </Typography>
        <Grid container spacing={4}>
          {chapters.length === 0 ? (
            <Typography variant="body1" color="textSecondary">
              Aucun chapitre disponible pour ce manga.
            </Typography>
          ) : (
            chapters.map((chapter) => (
              <Grid item key={chapter._id} xs={12} sm={6} md={4}>
                <Link href={`/manga/${manga._id}/chapter/${chapter._id}`} passHref style={{ textDecoration: 'none' }}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: 3,
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h2"
                        sx={{ color: '#1976d2', fontWeight: 'bold' }}
                      >
                        {chapter.chapterTitle}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        Chapitre {chapter.chapterNumber}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button variant="contained" color="primary" fullWidth>
                        Lire le Chapitre
                      </Button>
                    </Box>
                  </Card>
                </Link>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </>
  );
};

export default MangaDetailContent;