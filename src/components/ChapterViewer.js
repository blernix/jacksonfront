'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules'; // Suppression de Pagination
import 'swiper/css';
import 'swiper/css/navigation';
import { Box, Typography, IconButton, LinearProgress, Button } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import Link from 'next/link';
import Image from 'next/image';


const ChapterViewer = ({ pages, nextChapterUrl }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const swiperRef = useRef(null);
  const viewerRef = useRef(null);

  // Activer/Désactiver le mode plein écran avec l'API
  const toggleFullScreen = () => {
    if (!isFullScreen && viewerRef.current.requestFullscreen) {
      viewerRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  // Mettre à jour l’état du plein écran
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  return (
    <Box
      ref={viewerRef}
      sx={{
        width: '100%',
        height: isFullScreen ? '100vh' : '80vh',
        position: 'relative',
        backgroundColor: 'black',
        color: 'white',
        overflow: 'hidden',
        borderRadius: isFullScreen ? '0' : '8px',
      }}
    >
      {/* Bouton de plein écran */}
      <IconButton
        onClick={toggleFullScreen}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: '#fff',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        }}
      >
        {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </IconButton>

      {/* Barre de progression */}
      <LinearProgress
        variant="determinate"
        value={(currentPage / pages.length) * 100}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '& .MuiLinearProgress-bar': { backgroundColor: '#1976d2' },
        }}
      />

      <Swiper
        ref={swiperRef}
        modules={[Navigation, A11y]}
        navigation
        spaceBetween={50}
        slidesPerView={1}
        onSlideChange={(swiper) => setCurrentPage(swiper.activeIndex + 1)} // Mise à jour de la page actuelle
        style={{ height: '100%' }}
      >
        {pages.map((page, index) => (
          <SwiperSlide key={index}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
           <Image
  src={page}
  alt={`Page ${index + 1}`}
  layout="responsive"
  width={500}
  height={700} // ajustez selon le format d'affichage souhaité
  style={{
    borderRadius: '8px',
    margin: '0 auto',
  }}
/>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Lien vers le chapitre suivant */}
      {currentPage === pages.length && nextChapterUrl && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Link href={nextChapterUrl} passHref>
            <Button variant="contained" color="primary">
              Lire le chapitre suivant
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default ChapterViewer;