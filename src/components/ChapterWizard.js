import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import axios from 'axios';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';
import { v4 as uuidv4 } from 'uuid';

const steps = ['Informations de base', 'Fichiers'];

const ChapterWizard = ({ item, onClose, showNotification, refreshData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [mangaList, setMangaList] = useState([]);
  const [selectedManga, setSelectedManga] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [files, setFiles] = useState([]);

 
    // Remplir les valeurs avec `item` lorsqu'il change, si `item` existe
    useEffect(() => {
      if (item && mangaList.some(manga => manga._id === item.manga)) {
        setSelectedManga(item.manga);
      } else {
        setSelectedManga(''); // Met à vide si le manga n'est pas trouvé
      }
      setChapterTitle(item?.chapterTitle || '');
      setChapterNumber(item?.chapterNumber || 1);
      setFiles(item?.files ? item.files.map((url) => ({ id: uuidv4(), url })) : []);
    }, [item, mangaList]);


  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/manga`);
        setMangaList(response.data);
      } catch (error) {
        showNotification("Erreur lors du chargement des mangas.", "error");
      }
    };
    fetchMangas();
  }, [showNotification]);

  const handleFilesUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const uploadedFileUrls = [];

    for (let file of uploadedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'temp/chapter-manga');

      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, formData);
        uploadedFileUrls.push({
          id: uuidv4(),
          name: file.name,
          url: response.data.url,
          preview: URL.createObjectURL(file),
        });
      } catch (error) {
        showNotification("Erreur lors du téléchargement des fichiers.", "error");
        return;
      }
    }

    setFiles([...files, ...uploadedFileUrls]);
    showNotification("Fichiers téléchargés avec succès.", "success");
  };

  useEffect(() => {
    if (item) {
      console.log("État initialisé pour édition de chapitre:", {
        mangaId: selectedManga,
        title: chapterTitle,
        number: chapterNumber,
        files: files,
      });
    }
  }, [selectedManga, chapterTitle, chapterNumber, files, item]);

  const handleDeleteFile = (id) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };

  const handleSaveChapter = async () => {
    if (!selectedManga || !chapterTitle || files.length === 0) {
      showNotification('Veuillez remplir tous les champs requis et ajouter au moins un fichier.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      const chapterData = {
        manga: selectedManga,
        chapterTitle,
        chapterNumber,
        files: files.map((file) => file.url),
      };

      if (item) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/chapter/${item._id}`, chapterData, { headers: { Authorization: `Bearer ${token}` } });
        showNotification('Chapitre mis à jour avec succès.', 'success');
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chapter`, chapterData, { headers: { Authorization: `Bearer ${token}` } });
        showNotification('Chapitre ajouté avec succès.', 'success');
      }

      onClose();
      refreshData();
    } catch (error) {
      showNotification("Erreur lors de la sauvegarde du chapitre.", "error");
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = files.findIndex((file) => file.id === active.id);
      const newIndex = files.findIndex((file) => file.id === over.id);
      setFiles((files) => arrayMove(files, oldIndex, newIndex));
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
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Manga</InputLabel>
              <Select
                value={selectedManga}
                onChange={(e) => setSelectedManga(e.target.value)}
                required
                sx={{ color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                {mangaList.map((manga) => (
                  <MenuItem key={manga._id} value={manga._id}>
                    {manga.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Titre du Chapitre"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              fullWidth
              required
              margin="dense"
              sx={inputStyle}
            />
            <TextField
              label="Numéro du Chapitre"
              type="number"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(parseInt(e.target.value))}
              fullWidth
              required
              margin="dense"
              inputProps={{ min: 1 }}
              sx={inputStyle}
            />
          </>
        );
      case 1:
        return (
          <>
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
              Télécharger les fichiers du chapitre
              <input type="file" hidden multiple onChange={handleFilesUpload} />
            </Button>
            {files.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle1">Aperçu des fichiers :</Typography>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={files} strategy={verticalListSortingStrategy}>
                    {files.map((file) => (
                      <SortableItem key={file.id} id={file.id} file={file} onDelete={handleDeleteFile} />
                    ))}
                  </SortableContext>
                </DndContext>
              </Box>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          borderRadius: 2,
          boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      <DialogTitle>{item ? 'Modifier le Chapitre' : 'Ajouter un Nouveau Chapitre'}</DialogTitle>
      <DialogContent>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            '& .MuiStepIcon-root': {
              color: 'rgba(150, 150, 150, 0.5)',
              '&.Mui-active, &.Mui-completed': {
                color: 'rgba(200, 200, 200, 0.7)',
              },
            },
            '& .MuiStepLabel-label': {
              color: 'rgba(200, 200, 200, 0.7)',
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
          <Button onClick={() => setActiveStep((prev) => prev - 1)} sx={{ color: '#fff' }}>
            Retour
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button onClick={() => setActiveStep((prev) => prev + 1)} sx={{ color: '#fff' }}>
            Suivant
          </Button>
        ) : (
          <Button onClick={handleSaveChapter} sx={{ color: '#fff' }}>
            {item ? 'Enregistrer les Modifications' : 'Enregistrer le Chapitre'}
          </Button>
        )}
        <Button onClick={onClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChapterWizard;