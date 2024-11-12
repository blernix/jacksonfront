import React, { useState } from 'react';
import { Box, Fab, Tooltip, Zoom, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Description';
import BookIcon from '@mui/icons-material/Book';
import ChapterIcon from '@mui/icons-material/LibraryBooks';

const FloatingButton = ({ onSelectBlog, onSelectManga, onSelectChapter }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen(!open);

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 1 }}>
      <Tooltip title="Créer un contenu" arrow>
        <Fab sx={{ bgcolor: 'white', color: 'primary.main' }} onClick={handleToggle}>
          <AddIcon />
        </Fab>
      </Tooltip>
      {open && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column-reverse', // Change la direction pour que les icônes apparaissent au-dessus
            alignItems: 'center',
            gap: 1,
            mb: 2, // Espace entre les icônes et le bouton principal
          }}
        >
          <Zoom in={open} style={{ transitionDelay: open ? '100ms' : '0ms' }}>
            <Tooltip title="Ajouter un article de blog" placement="left" arrow>
              <IconButton
                onClick={onSelectBlog}
                sx={{ bgcolor: 'white', color: 'primary.main', mb: -1 }} // Utilisation de mb pour "margin-bottom" négatif
              >
                <ArticleIcon />
              </IconButton>
            </Tooltip>
          </Zoom>
          <Zoom in={open} style={{ transitionDelay: open ? '200ms' : '0ms' }}>
            <Tooltip title="Ajouter un manga" placement="left" arrow>
              <IconButton
                onClick={onSelectManga}
                sx={{ bgcolor: 'white', color: 'primary.main', mb: -1 }}
              >
                <BookIcon />
              </IconButton>
            </Tooltip>
          </Zoom>
          <Zoom in={open} style={{ transitionDelay: open ? '300ms' : '0ms' }}>
            <Tooltip title="Ajouter un chapitre" placement="left" arrow>
              <IconButton
                onClick={onSelectChapter}
                sx={{ bgcolor: 'white', color: 'primary.main', mb: -1 }}
              >
                <ChapterIcon />
              </IconButton>
            </Tooltip>
          </Zoom>
        </Box>
      )}
    </Box>
  );
};

export default FloatingButton;