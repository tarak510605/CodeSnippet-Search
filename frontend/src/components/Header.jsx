/**
 * Header Component
 * Application header with navigation and branding
 */

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Code as CodeIcon,
  GitHub as GitHubIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Favorite as FavoriteIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useThemeMode, useFavorites } from '../context';

function Header({ onShowFavorites, showingFavorites }) {
  const { darkMode, toggleDarkMode } = useThemeMode();
  const { getFavoritesCount } = useFavorites();
  const favCount = getFavoritesCount();

  return (
    <AppBar position="sticky" color="default" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        {/* Logo and Title */}
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
              onClick={() => onShowFavorites && onShowFavorites(false)}
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

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showingFavorites && (
            <Tooltip title="Back to Home">
              <IconButton 
                size="small" 
                sx={{ color: 'primary.main' }}
                onClick={() => onShowFavorites && onShowFavorites(false)}
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={showingFavorites ? "Back to Search" : "View Favorites"}>
            <IconButton 
              size="small" 
              sx={{ 
                color: showingFavorites ? 'error.main' : 'text.secondary',
              }}
              onClick={() => onShowFavorites && onShowFavorites(!showingFavorites)}
            >
              <Badge badgeContent={favCount} color="error" max={99}>
                <FavoriteIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton 
              size="small" 
              sx={{ color: 'text.secondary' }}
              onClick={toggleDarkMode}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="View on GitHub">
            <IconButton
              size="small"
              sx={{ color: 'text.secondary' }}
              href="https://github.com"
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
