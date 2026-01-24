/**
 * Main App Component
 * Root component that orchestrates the application
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { Header, SearchBar, SnippetList, AISuggestions } from './components';
import { snippetApi } from './services';
import { useFavorites } from './context';

function App() {
  // State for search results
  const [searchResults, setSearchResults] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Current search params (for pagination)
  const [currentSearch, setCurrentSearch] = useState(null);
  
  // Show favorites view
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get favorites from context
  const { favorites } = useFavorites();

  // Initial load: fetch popular snippets
  useEffect(() => {
    const loadPopular = async () => {
      try {
        setLoading(true);
        const response = await snippetApi.getPopular(12);
        setSearchResults(response.data);
        setPagination(null);
      } catch (err) {
        console.error('Failed to load popular snippets:', err);
      } finally {
        setLoading(false);
      }
    };
    if (!showFavorites && !currentSearch) {
      loadPopular();
    }
  }, [showFavorites, currentSearch]);

  /**
   * Handle search submission
   */
  const handleSearch = useCallback(async (params) => {
    setShowFavorites(false);
    setLoading(true);
    setError(null);
    setCurrentSearch(params);
    
    // If AI is enabled, show AI loading state
    if (params.includeAI) {
      setAiLoading(true);
    }

    try {
      const response = await snippetApi.search({
        ...params,
        page: 1,
        limit: 10,
      });

      setSearchResults(response.data.snippets);
      setAiSuggestions(response.data.ai);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Search failed';
      setError(errorMessage);
      setSearchResults([]);
      setAiSuggestions(null);
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  }, []);

  /**
   * Handle pagination
   */
  const handlePageChange = useCallback(async (page) => {
    if (!currentSearch) return;

    setLoading(true);

    try {
      const response = await snippetApi.search({
        ...currentSearch,
        page,
        limit: 10,
        includeAI: false, // Don't regenerate AI for pagination
      });

      setSearchResults(response.data.snippets);
      setPagination(response.pagination);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load page';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentSearch]);

  /**
   * Handle rating a snippet
   */
  const handleRate = useCallback(async (id, rating) => {
    const response = await snippetApi.rate(id, rating);
    
    // Update the snippet in results
    setSearchResults((prev) =>
      prev?.map((s) =>
        s._id === id
          ? { ...s, ratings: { average: response.data.average, count: response.data.count } }
          : s
      )
    );
    
    return response;
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Header 
        onShowFavorites={setShowFavorites} 
        showingFavorites={showFavorites}
        isSearching={currentSearch !== null}
        onGoHome={() => {
          setCurrentSearch(null);
          setShowFavorites(false);
          setAiSuggestions(null);
        }}
      />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section - Hide when showing favorites */}
        {!showFavorites && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Find the Perfect Code Snippet
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400 }}
            >
              Search through thousands of code snippets using natural language.
              Get AI-powered suggestions for improvements and edge cases.
            </Typography>
          </Box>
        )}

        {/* Search Bar - Hide when showing favorites */}
        {!showFavorites && (
          <SearchBar onSearch={handleSearch} loading={loading} />
        )}

        {/* Error Alert */}
        {error && !showFavorites && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* AI Suggestions */}
        {currentSearch && !showFavorites && (
          <AISuggestions suggestions={aiSuggestions} loading={aiLoading} />
        )}

        {/* Favorites Section */}
        {showFavorites && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              ❤️ My Favorites ({favorites.length})
            </Typography>
            {favorites.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No favorites yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click the heart icon on any snippet to add it to your favorites
                </Typography>
              </Box>
            ) : (
              <SnippetList
                snippets={favorites}
                loading={false}
                error={null}
                pagination={null}
                onRate={handleRate}
              />
            )}
          </Box>
        )}

        {/* Results Section - Hide when showing favorites */}
        {!showFavorites && (
          <Box sx={{ mb: 4 }}>
            {currentSearch ? (
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Search Results
              </Typography>
            ) : (
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Popular Snippets
              </Typography>
            )}

            <SnippetList
              snippets={searchResults}
              loading={loading}
              error={error}
              pagination={pagination}
              onPageChange={handlePageChange}
              onRate={handleRate}
            />
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Code Snippet Search • Built with React, Node.js, MongoDB & AI
        </Typography>
      </Box>

      {/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
