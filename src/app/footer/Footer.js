import { Box, Typography, Link } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box className="flex flex-col items-center mt-16 py-6 bg-gray-100">
      <Typography variant="body2" color="textSecondary" className="mb-2">
        Suivez-nous sur Instagram !
      </Typography>
      <Link href="https://www.instagram.com/dom_d_jack/" target="_blank" rel="noopener noreferrer">
        <InstagramIcon fontSize="large" color="primary" />
      </Link>
      <Typography variant="body2" color="textSecondary" className="mt-4">
        © 2024 Tous droits réservés.
      </Typography>
    </Box>
  );
};

export default Footer;