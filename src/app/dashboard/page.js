'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Box, Button, Typography, Container, Snackbar, Alert, TextField } from '@mui/material';
import axios from 'axios';
import SummaryTable from '../../components/SummaryTable';
import SectionAccordion from '../../components/SectionAccordion';
import Carousel from '../../components/Carousel';
import FloatingButton from '../../components/FloatingButton';
import BlogPostWizard from '../../components/BlogPostWizard';
import MangaWizard from '../../components/MangaWizard';
import ChapterWizard from '../../components/ChapterWizard';
import CategoryManager from '@/components/CategoryManager';

const Dashboard = () => {
  const [dataChanged, setDataChanged] = useState(false);
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState([]);
  const [mangas, setMangas] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [showBlogWizard, setShowBlogWizard] = useState(false);
  const [showMangaWizard, setShowMangaWizard] = useState(false);
  const [showChapterWizard, setShowChapterWizard] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentType, setCurrentType] = useState(null);
  const [articleSearch, setArticleSearch] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]); // État pour les articles filtrés


  // Ajout de handleEditCategory pour les catégories
const handleEditCategory = (category) => {
  setCurrentItem(category);
};
useEffect(() => {
  setFilteredArticles(
    articles.filter((article) =>
      article.title.toLowerCase().includes(articleSearch.toLowerCase())
    )
  );
}, [articleSearch, articles]);

const handleEditChapter = (chapter) => {
  if (chapter && chapter.manga && chapter.chapterTitle && chapter.chapterNumber) {
    setCurrentItem(chapter); // Définit le chapitre actuel à éditer
    setShowChapterWizard(true); // Ouvre le ChapterWizard
  } else {
    showNotification("Le chapitre sélectionné est incomplet ou corrompu.", "error");
  }
};

  const handleDeleteItem = async (id, type) => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.delete(`/api/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showNotification(`${type === 'blog' ? 'Article' : type === 'manga' ? 'Manga' : 'Catégorie'} supprimé avec succès.`, 'success');
      
      if (type === 'blog') {
        setArticles((prevArticles) => prevArticles.filter(article => article._id !== id));
        setFilteredArticles((prevArticles) => prevArticles.filter(article => article._id !== id)); // Mettre à jour les articles filtrés

      } else if (type === 'manga') {
        setMangas((prevMangas) => prevMangas.filter(manga => manga._id !== id));
      } else if (type === 'category') {
        setCategories((prevCategories) => prevCategories.filter(category => category._id !== id));
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${type} :`, error);
      showNotification(`Erreur lors de la suppression de ${type === 'blog' ? 'l\'article' : type === 'manga' ? 'le manga' : 'la catégorie'}.`, 'error');
    }
  };

  const handleEditItem = (item, type) => {
    setCurrentItem(item);
    setCurrentType(type);

    if (type === 'article') setShowBlogWizard(true);
    else if (type === 'manga') setShowMangaWizard(true);
    else if (type === 'chapter') setShowChapterWizard(true);
  };
  const fetchChapters = async (mangaId) => {
    try {
      const response = await axios.get(`/api/chapter?mangaId=${mangaId}`);
      const chapters = response.data.map((chapter) => ({
        ...chapter,
        manga: chapter.manga || mangaId,
        chapterTitle: chapter.chapterTitle || "Titre manquant",
        chapterNumber: chapter.chapterNumber || 1,
        files: chapter.files || [],
      }));
      return chapters;
    } catch (error) {
      console.error('Erreur lors de la récupération des chapitres:', error);
      return [];
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [articlesData, mangasData, categoriesData] = await Promise.all([
        axios.get('/api/blog'),
        axios.get('/api/manga'),
        axios.get('/api/category'),
      ]);
      setArticles(articlesData.data);
      setMangas(mangasData.data);
      setCategories(categoriesData.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataChanged) {
      refreshData();
    }
  }, [dataChanged]);

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  useEffect(() => {
    if (status === 'unauthenticated') signIn();
  }, [status]);

  useEffect(() => {
    if (session?.jwtToken) localStorage.setItem('jwtToken', session.jwtToken);
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesData, mangasData, categoriesData] = await Promise.all([
          axios.get('/api/blog'),
          axios.get('/api/manga'),
          axios.get('/api/category'),
        ]);
        setArticles(articlesData.data);
        setMangas(mangasData.data);
        setFilteredArticles(articlesData.data); // Initialiser les articles filtrés

        setCategories(categoriesData.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Typography>Chargement des données...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3">Dashboard</Typography>
        {session && (
          <Button onClick={() => signOut()} variant="outlined" color="secondary" sx={{ mt: 2 }}>
            Déconnexion
          </Button>
        )}
      </Box>

      <SummaryTable
        articlesCount={articles.length}
        mangasCount={mangas.length}
        categoriesCount={categories.length}
      />

      {/* Accordéons pour les Sections Articles, Mangas, Catégories */}
      <SectionAccordion title="Articles">
        <TextField
          variant="outlined"
          placeholder="Rechercher un article..."
          onChange={(e) => setArticleSearch(e.target.value)}
          sx={{
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
            backgroundColor: '#333333',
            borderRadius: 6,
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'transparent' },
              '&.Mui-focused fieldset': { borderColor: 'transparent' },
              '& input': { color: '#ffffff' },
              '&.Mui-focused': { outline: 'none' },
            },
          }}
        />

        <Carousel
          items={filteredArticles}
          type="article"
          onDelete={(id) => handleDeleteItem(id, 'blog')}
          onEdit={(item) => handleEditItem(item, 'article')}
        />
      </SectionAccordion>

      <SectionAccordion title="Mangas">
      <Carousel
  items={mangas}
  type="manga"
  onDelete={handleDeleteItem}
  onEdit={handleEditItem}
  onEditChapter={handleEditChapter}
  fetchChapters={fetchChapters}
  setCurrentItem={setCurrentItem} // Assurez-vous que c'est bien transmis
  setShowChapterWizard={setShowChapterWizard} // Assurez-vous que c'est bien transmis
/>
</SectionAccordion>

      <SectionAccordion title="Catégories">
        <Carousel
          items={categories}
          type="category"
          onDelete={(id) => handleDeleteItem(id, 'category')}
          onEdit={(item) => handleEditItem(item, 'category')}
          apiUrl={process.env.NEXT_PUBLIC_API_URL}
        showNotification={showNotification}
          onEditCategory={handleEditCategory} // Prop pour ouvrir en mode édition
          currentCategory={currentItem} // Passe la catégorie sélectionnée
        />
      </SectionAccordion>

      {/* Bouton Flottant pour Accès Rapide */}
      <FloatingButton
        onSelectBlog={() => { setCurrentItem(null); setShowBlogWizard(true); }}
        onSelectManga={() => { setCurrentItem(null); setShowMangaWizard(true); }}
        onSelectChapter={() => { setCurrentItem(null); setShowChapterWizard(true); }}
      />

      {/* Wizards pour Création ou Modification */}
      {showBlogWizard && (
        <BlogPostWizard
          item={currentItem}
          onClose={() => setShowBlogWizard(false)}
          showNotification={showNotification}
          refreshData={refreshData}
        />
      )}
      {showMangaWizard && (
        <MangaWizard
          item={currentItem}
          onClose={() => setShowMangaWizard(false)}
          showNotification={showNotification}
          refreshData={refreshData}
        />
      )}
      {showChapterWizard && (
        <ChapterWizard
          item={currentItem}
          onClose={() => setShowChapterWizard(false)}
          showNotification={showNotification}
          refreshData={refreshData}
        />
      )}

      {/* Snackbar pour Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;