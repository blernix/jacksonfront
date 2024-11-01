// src/app/manga/[mangaId]/page.js

import { notFound } from 'next/navigation';
import { Container, Typography, Grid, Box, Card, CardContent, Button, IconButton } from '@mui/material';
import Link from 'next/link';
import sanitizeHtml from 'sanitize-html';
import Navbar from '@/components/Navbar';
import Footer from '@/app/footer/Footer';
import MangaDetailContent from '@/components/MangaDetailContent';

async function fetchMangaData(mangaId) {
  try {
    // Fetch manga data
    const resManga = await fetch(`http://localhost:3000/api/manga/${mangaId}`, { cache: 'no-store' });
    if (!resManga.ok) notFound();
    const manga = await resManga.json();

    // Fetch chapters
    const resChapters = await fetch(`http://localhost:3000/api/chapter?mangaId=${mangaId}`, { cache: 'no-store' });
    if (!resChapters.ok) notFound();
    const chapters = await resChapters.json();

    return { manga, chapters };
  } catch (err) {
    console.error('Erreur lors de la récupération des données du manga :', err);
    notFound();
  }
}

const MangaDetailPage = async ({ params }) => {
  const { mangaId } = params;
  const data = await fetchMangaData(mangaId);

  if (!data) notFound();

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Navbar />
      <MangaDetailContent manga={data.manga} chapters={data.chapters} />
      <Footer />
    </Container>
  );
};

export default MangaDetailPage;