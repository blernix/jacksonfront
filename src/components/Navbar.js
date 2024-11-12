"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useScrollTrigger,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 80,
  });

  useEffect(() => {
    setScrolled(trigger);
  }, [trigger]);

  // Toggle Drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: scrolled ? '#1a1a1a' : 'transparent',
          transition: 'background-color 0.3s ease',
          boxShadow: scrolled ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
          color: scrolled ? '#e5e5e5' : '#ffffff',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo ou titre */}
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
            <Link href="/" style={{ color: scrolled ? '#e5e5e5' : '#fff', textDecoration: 'none' }}>
              LeMotDeTrop
            </Link>
          </Typography>

          {/* Liens de navigation pour les grands écrans */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Link href="/" passHref>
              <Button sx={{ color: scrolled ? '#e5e5e5' : '#ffffff' }}>Accueil</Button>
            </Link>
            <Link href="/blog" passHref>
              <Button sx={{ color: scrolled ? '#e5e5e5' : '#ffffff' }}>Blog</Button>
            </Link>
            <Link href="/manga" passHref>
              <Button sx={{ color: scrolled ? '#e5e5e5' : '#ffffff' }}>Mangas</Button>
            </Link>
          </Box>

          {/* Icône de menu pour mobile */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ display: { md: 'none' }, color: scrolled ? '#e5e5e5' : '#ffffff' }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer pour le menu mobile */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        <Box
          sx={{
            width: 250,
            backgroundColor: '#1a1a1a',
            color: '#e5e5e5',
            height: '100%',
          }}
        >
          <IconButton onClick={toggleDrawer} sx={{ justifyContent: 'flex-end', p: 2, color: '#e5e5e5' }}>
            <CloseIcon />
          </IconButton>
          <List>
            <ListItem button component={Link} href="/" onClick={toggleDrawer}>
              <ListItemText primary="Accueil" sx={{ textAlign: 'center' }} />
            </ListItem>
            <ListItem button component={Link} href="/blog" onClick={toggleDrawer}>
              <ListItemText primary="Blog" sx={{ textAlign: 'center' }} />
            </ListItem>
            <ListItem button component={Link} href="/manga" onClick={toggleDrawer}>
              <ListItemText primary="Mangas" sx={{ textAlign: 'center' }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;