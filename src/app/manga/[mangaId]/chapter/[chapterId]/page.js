import { notFound } from 'next/navigation';
import { Typography, Box, Container } from '@mui/material';
import ChapterViewer from '@/components/ChapterViewer';
import Footer from '@/app/footer/Footer';

import mongoose from 'mongoose';
import Chapter from '@/models/Chapter';
import connectToDatabase from '@/lib/mongodb';

const ChapterPage = async ({ params }) => {
  const { mangaId, chapterId } = params;

  await connectToDatabase();

  let chapter;
  let nextChapterUrl = null;

  try {
    chapter = await Chapter.findById(chapterId).lean();

    if (!chapter) {
      notFound();
    }

    const currentChapterNumber = Number(chapter.chapterNumber);
    const nextChapterNumber = currentChapterNumber + 1;

    // Ajout des logs pour le débogage
    console.log('mangaId:', mangaId);
    console.log('currentChapterNumber:', currentChapterNumber);
    console.log('nextChapterNumber:', nextChapterNumber);

    const nextChapter = await Chapter.findOne({
      manga: mangaId,
      chapterNumber: nextChapterNumber,
    }).lean();

    console.log('nextChapter:', nextChapter);

    if (nextChapter) {
      nextChapterUrl = `/manga/${mangaId}/chapter/${nextChapter._id}`;
    } else {
      console.log('Aucun chapitre suivant trouvé.');
    }
  } catch (err) {
    console.error('Erreur lors de la récupération du chapitre :', err);
    notFound();
  }



  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* Informations du Chapitre */}
      <Box mb={4} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          {chapter.chapterTitle}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Chapitre {chapter.chapterNumber}
        </Typography>
      </Box>

      {/* Visionneuse de Chapitre */}
      <Box mt={6}>
        {chapter.files && chapter.files.length > 0 ? (
          <ChapterViewer pages={chapter.files} nextChapterUrl={nextChapterUrl} />
        ) : (
          <Typography variant="body1" color="textSecondary">
            Aucun fichier disponible pour ce chapitre.
          </Typography>
        )}
      </Box>

      <Footer />
    </Container>
  );
};

export default ChapterPage;