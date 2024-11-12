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
  useMediaQuery,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RichTextEditor from './RichtextEditor';
import axios from 'axios';

const BlogPostWizard = ({ item, onClose, showNotification, refreshData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState(item?.title || '');
  const [author, setAuthor] = useState(item?.author || '');
  const [categories, setCategories] = useState(item?.categories || []);
  const [tags, setTags] = useState(item?.tags || []);
  const [content, setContent] = useState(item?.content || '');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const steps = ['Informations de base', 'Catégories & Tags', 'Contenu'];

  const getJwtToken = () => localStorage.getItem('jwtToken');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/category`);
        setAvailableCategories(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleTagAddition = () => {
    if (tagInput) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleOpenCategoryDialog = () => setIsCategoryDialogOpen(true);
  const handleCloseCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setNewCategoryTitle('');
  };

  const handleSaveCategory = async () => {
    try {
      const token = getJwtToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category`,
        { title: newCategoryTitle.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableCategories([...availableCategories, response.data]);
      setCategories([...categories, response.data._id]);
      showNotification('Catégorie ajoutée avec succès.', 'success');
      handleCloseCategoryDialog();
    } catch (error) {
      showNotification("Erreur lors de l'ajout de la catégorie.", 'error');
      console.error("Erreur lors de l'ajout de la catégorie :", error);
    }
  };

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleSavePost = async () => {
    if (!title || !author || !content) {
      showNotification('Veuillez remplir tous les champs requis.', 'error');
      return;
    }
  
    setIsSaving(true);
    console.log("Début de la sauvegarde de l'article");
  
    try {
      const token = getJwtToken();
      const postData = { title, author, categories, tags, content };
  
      console.log("Données envoyées :", postData);
      
      if (item) {
        // Mise à jour d'un article existant
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${item._id}`,
          postData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Réponse de la mise à jour :", response.data);
        showNotification("Article mis à jour avec succès.", "success");
      } else {
        // Création d'un nouvel article
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog`,
          postData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Réponse de l'ajout :", response.data);
        showNotification('Article ajouté avec succès.', 'success');
      }
  
      onClose();
      refreshData();
  
    } catch (error) {
      showNotification("Erreur lors de la sauvegarde de l'article.", 'error');
      console.error("Erreur lors de la requête :", error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              label="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              margin="dense"
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            />
            <TextField
              label="Auteur"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              fullWidth
              required
              margin="dense"
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Catégories</InputLabel>
              <Select
  multiple
  value={categories}
  onChange={(e) => setCategories(e.target.value)}
  renderValue={(selected) =>
    selected
      .map((id) => availableCategories.find((cat) => cat._id === id)?.title)
      .join(', ')
  }
  sx={{
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    '& .MuiSvgIcon-root': { color: '#fff' },
    '& .MuiPaper-root': { // Ajout du style pour le menu déroulant
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
    },
  }}
>
                {availableCategories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              onClick={handleOpenCategoryDialog}
              variant="outlined"
              color="primary"
              sx={{
                mt: 2,
                color: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Ajouter une Catégorie
            </Button>
            <TextField
              label="Ajouter un tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setTags([...tags, tagInput])}
              fullWidth
              margin="dense"
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            />
            <Box mt={1}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => setTags(tags.filter((t) => t !== tag))}
                  sx={{ margin: '2px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
                />
              ))}
            </Box>
          </>
        );
      case 2:
        return (
          <Box>
            <RichTextEditor value={content} onChange={setContent} />
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
      <DialogTitle>{item ? 'Modifier l\'Article' : 'Ajouter un Nouvel Article'}</DialogTitle>
      <DialogContent>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            '& .MuiStepIcon-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiStepLabel-label': {
              color: 'rgba(255, 255, 255, 0.7)',
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
          <Button onClick={() => setActiveStep(activeStep - 1)} sx={{ color: '#fff' }}>
            Retour
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
  <Button onClick={handleNext} sx={{ color: '#fff' }}>
    Suivant
  </Button>
) : (
  <Button onClick={handleSavePost} sx={{ color: '#fff' }}>
    {item ? 'Enregistrer les Modifications' : 'Enregistrer l\'Article'}
  </Button>
)}
        <Button onClick={onClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Annuler
        </Button>
      </DialogActions>

      {/* Dialogue pour ajouter une nouvelle catégorie */}
      <Dialog open={isCategoryDialogOpen} onClose={handleCloseCategoryDialog}>
        <DialogTitle sx={{ color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          Ajouter une nouvelle catégorie
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#fff' }}>
          <TextField
            label="Titre de la catégorie"
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)}
            fullWidth
            required
            margin="dense"
            sx={{
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <Button onClick={handleCloseCategoryDialog} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Annuler
          </Button>
          <Button onClick={handleSaveCategory} sx={{ color: '#fff' }}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default BlogPostWizard;