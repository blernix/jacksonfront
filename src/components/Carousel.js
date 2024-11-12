import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSwipeable } from 'react-swipeable';

const Carousel = ({ items, type, onDelete, onEdit, onEditChapter, fetchChapters, setCurrentItem, setShowChapterWizard }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentChapters, setCurrentChapters] = useState([]);
  const [selectedManga, setSelectedManga] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => isMobile && setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1)),
    onSwipedRight: () => isMobile && setCurrentIndex((prev) => Math.max(prev - 1, 0)),
    trackMouse: true,
  });

  const handleOpenDialog = async (manga) => {
    setSelectedManga(manga);
    try {
      const chapters = await fetchChapters(manga._id);
      if (chapters) {
        setCurrentChapters(chapters);
        setIsDialogOpen(true);
      } else {
        console.error("Aucun chapitre récupéré pour ce manga.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des chapitres :", error);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentChapters([]);
  };

  const handleEditChapter = (chapter) => {
    if (chapter && chapter.manga && chapter.chapterTitle && chapter.chapterNumber && chapter.files) {
      setCurrentItem(chapter);
      setShowChapterWizard(true);
    } else {
      console.log("Le chapitre sélectionné est incomplet ou corrompu.");
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    await onDelete(chapterId, "chapter");
    setCurrentChapters((prevChapters) => prevChapters.filter((ch) => ch._id !== chapterId));
  };

  const renderItemDetails = (item) => {
    if (type === "article") {
      return (
        <>
          <Typography variant="body2" color="white">
            Catégorie(s) :{" "}
            {item.categories && item.categories.length > 0
              ? item.categories.map((category) => category.title).join(", ")
              : "Sans catégorie"}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {item.tags?.length > 0 ? (
              item.tags.map((tag, idx) => (
                <Chip key={idx} label={tag} color="primary" size="small" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">Aucun tag</Typography>
            )}
          </Box>
        </>
      );
    } else if (type === "category") {
      return (
        <Typography variant="body2" color="white">
          Articles liés : {item.articleCount || 0}
        </Typography>
      );
    } else if (type === "manga") {
      return (
        <>
          <Typography variant="body2" color="white">Auteur : {item.author || "Inconnu"}</Typography>
          <Typography variant="body2" color="white">Nombre de chapitres : {item.chapterCount || 0}</Typography>
        </>
      );
    }
  };

  return (
    <>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {items.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Box
              sx={{
                padding: 2,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" gutterBottom>{item.title || "Titre manquant"}</Typography>
              {renderItemDetails(item)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                {type === "manga" && (
                  <IconButton 
                    onClick={() => handleOpenDialog(item)} 
                    sx={{ 
                      backgroundColor: 'black', 
                      color: 'white', 
                      borderRadius: '50%', 
                      padding: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                )}
                <IconButton 
                  onClick={() => onEdit(item, type)} 
                  sx={{ 
                    backgroundColor: 'black', 
                    color: 'white', 
                    borderRadius: '50%', 
                    padding: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(item._id, type)}
                  sx={{ 
                    backgroundColor: 'black', 
                    color: 'white', 
                    borderRadius: '50%', 
                    padding: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            borderRadius: 2,
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            padding: 2,
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.3)', mb: 2 }}>
          Chapitres de {selectedManga?.title}
        </DialogTitle>
        <DialogContent>
          {currentChapters.map((chapter) => (
            <Box key={chapter._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1, p: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="body2">{chapter.chapterTitle}</Typography>
              <Box>
                <IconButton onClick={() => onEditChapter(chapter)} sx={{ color: '#2196f3' }}>
                  <EditIcon sx={{ color: 'white' }} />
                </IconButton>
                <IconButton onClick={() => handleDeleteChapter(chapter._id)} sx={{ color: '#f44336' }}>
                  <DeleteIcon sx={{ color: 'white' }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Carousel;