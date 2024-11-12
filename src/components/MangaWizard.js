import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Box,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const steps = ['Informations de base', 'Description et Auteur', 'Image de couverture'];

const MangaWizard = ({ item, onClose, showNotification, refreshData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState(item ? item.title : '');
  const [description, setDescription] = useState(item ? item.description : '');
  const [author, setAuthor] = useState(item ? item.author : '');
  const [coverImage, setCoverImage] = useState(item ? item.coverImage : '');

  const getJwtToken = () => localStorage.getItem('jwtToken');

  const handleCoverImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'temp/manga-cover');

      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, formData);
        setCoverImage(response.data.url);
        showNotification('Image téléchargée avec succès.', 'success');
      } catch (error) {
        showNotification("Erreur lors du téléchargement de l'image.", 'error');
        console.error("Erreur d'upload :", error);
      }
    }
  };

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleSaveManga = async () => {
    if (!title || !author || !coverImage) {
      showNotification('Veuillez remplir tous les champs requis.', 'error');
      return;
    }

    try {
      const token = getJwtToken();
      const mangaData = { title, description, author, coverImage };

      if (item) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manga/${item._id}`,
          mangaData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification('Manga mis à jour avec succès.', 'success');
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manga`,
          mangaData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification('Manga ajouté avec succès.', 'success');
      }

      onClose();
      refreshData();

    } catch (error) {
      showNotification('Erreur lors de la sauvegarde du manga.', 'error');
      console.error('Erreur lors de l’ajout du manga :', error);
    }
  };

  const renderStepContent = (step) => {
    const inputStyle = {
      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
      '& .MuiOutlinedInput-root': {
        color: '#fff',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    };

    switch (step) {
      case 0:
        return (
          <TextField
            label="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            margin="dense"
            sx={inputStyle}
          />
        );
      case 1:
        return (
          <>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              margin="dense"
              sx={inputStyle}
            />
            <TextField
              label="Auteur"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              fullWidth
              required
              margin="dense"
              sx={inputStyle}
            />
          </>
        );
      case 2:
        return (
          <Box textAlign="center">
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                mt: 2,
                color: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              Télécharger l'image de couverture
              <input type="file" hidden onChange={handleCoverImageUpload} />
            </Button>
            {coverImage && <img src={coverImage} alt="Cover Preview" style={{ marginTop: '16px', width: '100%' }} />}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          borderRadius: isMobile ? 0 : 2,
          boxShadow: isMobile ? 'none' : '0 0 15px rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      <DialogTitle>{item ? 'Modifier le Manga' : 'Ajouter un Nouveau Manga'}</DialogTitle>
      <DialogContent>
      <Stepper
  activeStep={activeStep}
  alternativeLabel
  orientation="horizontal" // Remis en ligne comme demandé
  sx={{
    '& .MuiStepIcon-root': {
      color: 'rgba(150, 150, 150, 0.5)', // Icônes des étapes non validées en gris clair
      '&.Mui-active, &.Mui-completed': {
        color: 'rgba(200, 200, 200, 0.7)', // Icônes des étapes actives/validées en gris
      },
    },
    '& .MuiStepLabel-label': {
      color: 'rgba(200, 200, 200, 0.7)', // Labels en gris clair
    },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box my={2}>{renderStepContent(activeStep)}</Box>
      </DialogContent>
      <DialogActions>
        {activeStep > 0 && (
          <Button onClick={handleBack} sx={{ color: '#fff' }}>
            Retour
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} sx={{ color: '#fff' }}>
            Suivant
          </Button>
        ) : (
          <Button onClick={handleSaveManga} sx={{ color: '#fff' }}>
            {item ? 'Enregistrer les Modifications' : 'Enregistrer le Manga'}
          </Button>
        )}
        <Button onClick={onClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MangaWizard;