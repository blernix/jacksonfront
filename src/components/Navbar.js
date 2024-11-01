"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useScrollTrigger, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
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
          backgroundColor: scrolled ? '#ffffff' : 'transparent',
          transition: 'background-color 0.3s ease',
          boxShadow: scrolled ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
          color: scrolled ? '#333' : '#ffffff',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo ou titre */}
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            <Link href="/" style={{ color: scrolled ? '#333' : '#fff', textDecoration: 'none' }}>
              LeMotDeTrop
            </Link>
          </Typography>

          {/* Liens de navigation pour les grands écrans */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Link href="/" passHref>
              <Button sx={{ color: scrolled ? '#333' : '#ffffff' }}>Accueil</Button>
            </Link>
            <Link href="/blog" passHref>
              <Button sx={{ color: scrolled ? '#333' : '#ffffff' }}>Blog</Button>
            </Link>
            <Link href="/manga" passHref>
              <Button sx={{ color: scrolled ? '#333' : '#ffffff' }}>Mangas</Button>
            </Link>
            {/* Ajouter d'autres liens ici */}
          </Box>

          {/* Icône de menu pour mobile */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ display: { md: 'none' }, color: scrolled ? '#333' : '#ffffff' }}
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
            backgroundColor: '#ffffff',
            height: '100%',
          }}
        >
          <IconButton onClick={toggleDrawer} sx={{ justifyContent: 'flex-end', p: 2 }}>
            <CloseIcon />
          </IconButton>
          <List>
            <ListItem button component={Link} href="/" onClick={toggleDrawer}>
              <ListItemText primary="Accueil" />
            </ListItem>
            <ListItem button component={Link} href="/blog" onClick={toggleDrawer}>
              <ListItemText primary="Blog" />
            </ListItem>
            <ListItem button component={Link} href="/manga" onClick={toggleDrawer}>
              <ListItemText primary="Mangas" />
            </ListItem>
            {/* Ajouter d'autres liens ici */}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;