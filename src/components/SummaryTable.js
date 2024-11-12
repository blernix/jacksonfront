import React from 'react';
import { Grid, Typography, Card, CardContent } from '@mui/material';

const SummaryTable = ({ articlesCount, mangasCount, categoriesCount }) => (
  <Grid container spacing={2} sx={{ mb: 3 }}>
    {[
      { label: 'Articles', count: articlesCount },
      { label: 'Mangas', count: mangasCount },
      { label: 'Catégories', count: categoriesCount },
    ].map((item) => (
      <Grid item xs={12} sm={4} key={item.label}>
        <Card
          sx={{
            backdropFilter: 'blur(8px)', // Effet de flou
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Transparence
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.3)', // Bordure subtile
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)', // Ombre douce
            color: 'white', // Texte blanc pour contraste
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: 'poppins', fontWeight: 'bold', mb: 1 }}>
              {item.label}
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: 'poppins' }}>
              {item.count}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default SummaryTable;