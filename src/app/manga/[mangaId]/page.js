// src/app/manga/[mangaId]/page.js

import { notFound } from 'next/navigation';
import { Container } from '@mui/material';
import Navbar from '@/components/Navbar';
import Footer from '@/app/footer/Footer';
import MangaDetailContent from '@/components/MangaDetailContent';

async function fetchMangaData(mangaId) {
  try {
    // Fetch manga data
    const resManga = await fetch(`/api/manga/${mangaId}`, { cache: 'no-store' });
    if (!resManga.ok) notFound();
    const manga = await resManga.json();

    // Fetch chapters
    const resChapters = await fetch(`/api/chapter?mangaId=${mangaId}`, { cache: 'no-store' });
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