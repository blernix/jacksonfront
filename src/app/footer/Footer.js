import { Box, Typography, Link, IconButton } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        py: 3,
        mt: 'auto',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #1f1f1f 100%)',
        color: '#d9d9d9',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        boxShadow: '0px -5px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e5e5e5', mb: 1 }}>
        Rejoignez-nous !
      </Typography>

      {/* Icônes sociales stylisées */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Link href="https://www.instagram.com/dom_d_jack/" target="_blank" rel="noopener noreferrer">
          <IconButton
            sx={{
              color: '#e1306c',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: '#e1306c',
                color: '#ffffff',
                transform: 'scale(1.15)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            <InstagramIcon fontSize="large" />
          </IconButton>
        </Link>

        <Link href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
          <IconButton
            sx={{
              color: '#ff0000',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: '#ff0000',
                color: '#ffffff',
                transform: 'scale(1.15)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            <YouTubeIcon fontSize="large" />
          </IconButton>
        </Link>
      </Box>

      {/* Texte de copyright stylisé */}
      <Typography variant="body2" sx={{ mt: 2, color: '#b0b0b0', fontSize: '0.85rem' }}>
  © 2024 | Créé avec 
  <a href="/login" style={{ color: '#ff5722', textDecoration: 'none', cursor: 'default' }}>
    passion 
  </a> 
   et <span style={{ color: '#0077b6' }}>précision</span>.
</Typography>
    </Box>
  );
};

export default Footer;