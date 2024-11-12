import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SectionAccordion = ({ title, children }) => (
  <Accordion
    sx={{
      backdropFilter: 'blur(6px)', // Effet de flou pour fond
      backgroundColor: 'transparent', // Transparence subtile
      borderRadius: 2, // Coins arrondis
      border: '1px solid rgba(255, 255, 255, 0.3)', // Bordure légère
      boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)', // Ombre douce
      color: 'white', // Texte blanc
      overflow: 'hidden', // Pour conserver l’effet visuel aux bords
      '&:before': { display: 'none' }, // Supprime la ligne par défaut de l'Accordion
    }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
      <Typography variant="h6" sx={{ fontFamily: 'poppins', fontWeight: 'bold' }}>
        {title}
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      {children}
    </AccordionDetails>
  </Accordion>
);

export default SectionAccordion;