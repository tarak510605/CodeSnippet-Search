/**
 * Header Component
 * Application header with navigation and branding
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Badge,
  Button,
  Avatar,
} from '@mui/material';
import {
  Code as CodeIcon,
  GitHub as GitHubIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Favorite as FavoriteIcon,
  Home as HomeIcon,
  MenuBook as LibraryIcon,
} from '@mui/icons-material';
import { useThemeMode, useFavorites, useAuth } from '../context';

function Header({
  onShowFavorites,
  showingFavorites,
  onShowLibrary,
  showingLibrary,
  libraryCount = 0,
}) {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const { getFavoritesCount } = useFavorites();
  const { user, isAuthenticated, logout } = useAuth();
  const favCount = getFavoritesCount();
  const inSpecialView = showingFavorites || showingLibrary;

  const goHome = () => {
    onShowFavorites?.(false);
    onShowLibrary?.(false);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" color="default" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'white',
            }}
          >
            <CodeIcon />
          </Box>
          <Box>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer',
              }}
              onClick={goHome}
            >
              CodeSnippet Search
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
            >
              AI-Powered Code Discovery
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, mr: 1 }}>
                {user?.username}
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Button variant="outlined" size="small" onClick={handleLogout} sx={{ ml: 1 }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outlined" size="small" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="contained" size="small" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </>
          )}

          {inSpecialView && (
            <Tooltip title="Back to Home">
              <IconButton size="small" sx={{ color: 'primary.main' }} onClick={goHome}>
                <HomeIcon />
              </IconButton>
            </Tooltip>
          )}

          {isAuthenticated && (
            <Tooltip title={showingLibrary ? 'My Library' : 'View saved snippets'}>
              <IconButton
                size="small"
                sx={{ color: showingLibrary ? 'primary.main' : 'text.secondary' }}
                onClick={() => onShowLibrary?.(!showingLibrary)}
              >
                <Badge badgeContent={libraryCount} color="primary" max={99}>
                  <LibraryIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={showingFavorites ? 'Back to Search' : 'View Favorites'}>
            <IconButton
              size="small"
              sx={{ color: showingFavorites ? 'error.main' : 'text.secondary' }}
              onClick={() => onShowFavorites?.(!showingFavorites)}
            >
              <Badge badgeContent={favCount} color="error" max={99}>
                <FavoriteIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={toggleDarkMode}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="View on GitHub">
            <IconButton
              size="small"
              sx={{ color: 'text.secondary' }}
              href="https://github.com/tarak510605/CodeSnippet-Search.git"
              target="_blank"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
