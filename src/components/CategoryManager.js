import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const CategoryManager = ({ apiUrl, showNotification, onEditCategory, currentCategory }) => {
  const [categoryList, setCategoryList] = useState([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const getJwtToken = () => localStorage.getItem('jwtToken') || null;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (currentCategory) {
      setEditingCategory(currentCategory);
      setNewCategoryTitle(currentCategory.title);
      setIsCategoryDialogOpen(true);
    }
  }, [currentCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/category`);
      setCategoryList(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories :', error);
      showNotification('Erreur lors de la récupération des catégories.', 'error');
    }
  };

  const handleCloseCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setNewCategoryTitle('');
    setEditingCategory(null);
  };

  const handleSaveCategory = async () => {
    const token = getJwtToken();
    if (!token) return showNotification("Échec de l'authentification.", 'error');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      let response;
      if (editingCategory) {
        response = await axios.put(`${apiUrl}/api/category`, { _id: editingCategory._id, title: newCategoryTitle }, { headers });
        setCategoryList(categoryList.map(cat => (cat._id === response.data._id ? response.data : cat)));
      } else {
        response = await axios.post(`${apiUrl}/api/category`, { title: newCategoryTitle }, { headers });
        setCategoryList([...categoryList, response.data]);
      }
      handleCloseCategoryDialog();
      showNotification('Catégorie enregistrée avec succès.', 'success');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la catégorie :", error);
      showNotification("Erreur lors de l'enregistrement de la catégorie.", 'error');
    }
  };

  const handleEditCategoryClick = (category) => {
    onEditCategory(category);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 3 }}>
        Gestion des Catégories
      </Typography>

      <Grid container spacing={2}>
        {categoryList.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category._id}>
            <Card sx={{ backgroundColor: '#1E1E1E', color: '#FFFFFF' }}>
              <CardContent>
                <Typography>{category.title}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => handleEditCategoryClick(category)}
                  sx={{ color: '#fff' }}
                >
                  Modifier
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteCategory(category._id)}
                  color="error"
                  sx={{ color: '#f44336' }}
                >
                  Supprimer
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={isCategoryDialogOpen} onClose={handleCloseCategoryDialog}>
        <DialogTitle sx={{ color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          {editingCategory ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#fff' }}>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la Catégorie"
            type="text"
            fullWidth
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)}
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
            {editingCategory ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManager;