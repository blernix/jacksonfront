"use client";

import { useState } from 'react';
import { Typography, Grid, Box, Card, CardContent, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import sanitizeHtml from 'sanitize-html';
import Image from 'next/image';

const MangaDetailContent = ({ manga, chapters }) => {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <>
      {/* Manga Information */}
      <Box mb={6} textAlign="center" position="relative" color="#d9d9d9">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
          {manga.title}
        </Typography>
        <Typography variant="subtitle1" color="#b3b3b3">
          Par {manga.author}
        </Typography>

        <Box position="relative" display="inline-block" mt={4}>
          {manga.coverImage && (
            <Image src={manga.coverImage} alt={manga.title} layout="responsive" width={500} height={300} style={{ borderRadius: '8px' }} />
          )}
          
          {/* Button to reveal description */}
          <IconButton
            onClick={() => setShowDescription(!showDescription)}
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#ffffff',
              zIndex: 2,
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
              maxHeight="60%"
              bgcolor="rgba(0, 0, 0, 0.8)"
              color="#ffffff"
              p={2}
              sx={{
                borderRadius: '0 0 8px 8px',
                overflowY: 'auto',
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
        <Typography variant="h4" gutterBottom sx={{ color: '#d9d9d9', textAlign: 'center' }}>
          Chapitres
        </Typography>
        <Grid container spacing={4} mt={4}>
          {chapters.length === 0 ? (
            <Typography variant="body1" color="#b3b3b3" textAlign="center" width="100%">
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
                      boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0px 10px 20px rgba(0, 119, 182, 0.4)' },
                      backgroundColor: '#1a1a1a',
                      color: '#ffffff',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h2"
                        sx={{ color: '#0077b6', fontWeight: 'bold' }}
                      >
                        {chapter.chapterTitle}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: '#b3b3b3' }}>
                        Chapitre {chapter.chapterNumber}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          backgroundColor: '#0077b6',
                          color: '#ffffff',
                          '&:hover': { backgroundColor: '#005f87' },
                        }}
                      >
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