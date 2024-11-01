'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Skeleton, Typography, Box, Container, Grid, Card, CardContent, Button, CardMedia } from '@mui/material';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import styles from '@/styles/ArticleStyles.module.css';

const BlogPostPage = ({ params }) => {
  const { id } = params;
  const [blogPost, setBlogPost] = useState(null);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const response = await axios.get(`/api/blog/${id}`);
        const article = response.data;
        setBlogPost(article);

        // Fetch des articles recommandés basés sur les tags et la catégorie, en excluant l'article actuel
        if (article.tags?.length || article.categories?.length) {
          fetchRecommendedPosts(article.tags, article.categories, id);
        }
      } catch (err) {
        setError('Article introuvable');
        console.error("Erreur lors de la récupération de l'article :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  const fetchRecommendedPosts = async (tags, categories, currentId) => {
    try {
      // Conversion des tags en chaîne de caractères si existants
      const tagsParam = tags ? tags.join(',') : '';
      const categoriesParam = categories ? categories.join(',') : '';

      const response = await axios.get(`/api/blog/recommended`, {
        params: { tags: tagsParam, categories: categoriesParam, currentId },
      });
      console.log("Articles recommandés reçus :", response.data); // Log pour vérifier les données reçues
      setRecommendedPosts(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des articles recommandés :", err);
    }
  };

  if (error) return <p>{error}</p>;
  if (loading) return <Skeleton variant="rectangular" height={400} animation="wave" />;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* Bouton de retour au blog */}
      <Box mb={4} textAlign="left">
        <Link href="/blog" passHref>
          <Button variant="outlined" color="primary" sx={{ mb: 2 }}>
            ← Retourner au Blog
          </Button>
        </Link>
      </Box>

      <Box mb={4} textAlign="center">
        <Typography variant="h2" component="h1" gutterBottom className={styles.articleTitle}>
          {blogPost.title}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" className={styles.articleAuthor}>
          Par {blogPost.author}
        </Typography>
      </Box>

      <div
        className={`${styles.prose} ${styles.readingMode}`}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(blogPost.content, {
            ADD_TAGS: ['img'],
            ADD_ATTR: ['loading'],
          }),
        }}
      />

      {/* Section des articles recommandés */}
      {recommendedPosts.length > 0 && (
        <Box mt={8}>
          <Typography variant="h4" gutterBottom>
            Articles Similaires
          </Typography>
          <Grid container spacing={4}>
            {recommendedPosts.map((post) => (
              <Grid item key={post._id} xs={12} sm={6} md={4}>
                <Link href={`/blog/${post._id}`} passHref>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: 3,
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6,
                      },
                      cursor: 'pointer',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {post.imageUrl && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={post.imageUrl}
                        alt={post.title}
                        sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {DOMPurify.sanitize(post.content).replace(/<[^>]*>?/gm, '').slice(0, 80)}...
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default BlogPostPage;