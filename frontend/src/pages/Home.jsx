/**
 * Home Page
 * Main search and snippet discovery view
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import { Header, SearchBar, SnippetList, AISuggestions, GeneratePanel, AnalyticsSection } from '../components';
import { snippetApi } from '../services';
import { useFavorites, useAuth } from '../context';

function Home() {
  const [searchResults, setSearchResults] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSearch, setCurrentSearch] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySnippets, setLibrarySnippets] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { favorites } = useFavorites();
  const { isAuthenticated } = useAuth();

  const loadLibrary = useCallback(async () => {
    if (!isAuthenticated) return;
    setLibraryLoading(true);
    setLibraryError(null);
    try {
      const response = await snippetApi.getMyLibrary({ limit: 50, sortBy: 'recent' });
      setLibrarySnippets(response.data);
    } catch (err) {
      setLibraryError(err.response?.data?.message || 'Failed to load your library');
      setLibrarySnippets([]);
    } finally {
      setLibraryLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (showLibrary && isAuthenticated) {
      loadLibrary();
    }
  }, [showLibrary, isAuthenticated, loadLibrary]);

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
    if (!showFavorites && !showLibrary && !currentSearch) {
      loadPopular();
    }
  }, [showFavorites, showLibrary, currentSearch]);

  const handleShowLibrary = useCallback((open = true) => {
    setShowLibrary(open);
    if (open) {
      setShowFavorites(false);
      setCurrentSearch(null);
    }
  }, []);

  const handleShowFavorites = useCallback((open) => {
    setShowFavorites(open);
    if (open) {
      setShowLibrary(false);
    }
  }, []);

  const handleSavedToLibrary = useCallback((navigateToLibrary = false) => {
    if (navigateToLibrary) {
      handleShowLibrary(true);
    } else {
      loadLibrary();
    }
  }, [handleShowLibrary, loadLibrary]);

  const handleSearch = useCallback(async (params) => {
    setShowFavorites(false);
    setShowLibrary(false);
    setLoading(true);
    setError(null);
    setCurrentSearch(params);

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

  const handlePageChange = useCallback(async (page) => {
    if (!currentSearch) return;

    setLoading(true);

    try {
      const response = await snippetApi.search({
        ...currentSearch,
        page,
        limit: 10,
        includeAI: false,
      });

      setSearchResults(response.data.snippets);
      setPagination(response.pagination);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load page';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentSearch]);

  const handleRate = useCallback(async (id, rating) => {
    const response = await snippetApi.rate(id, rating);

    const updateRatings = (s) =>
      s._id === id
        ? { ...s, ratings: { average: response.data.average, count: response.data.count } }
        : s;

    setSearchResults((prev) => prev?.map(updateRatings));
    setLibrarySnippets((prev) => prev?.map(updateRatings));

    return response;
  }, []);

  const handleClearSearch = () => {
    setCurrentSearch(null);
    setAiSuggestions(null);
    setError(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header
        onShowFavorites={handleShowFavorites}
        showingFavorites={showFavorites}
        onShowLibrary={handleShowLibrary}
        showingLibrary={showLibrary}
        libraryCount={librarySnippets.length}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {!showFavorites && !showLibrary && (
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

        {!showFavorites && !showLibrary && (
          <>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              centered
              sx={{ mb: 3 }}
            >
              <Tab label="🔍 Search Snippets" />
              <Tab label="✨ Generate with AI" />
            </Tabs>

            {activeTab === 0 ? (
              <SearchBar
                onSearch={handleSearch}
                onClearSearch={handleClearSearch}
                loading={loading}
                isSearching={currentSearch !== null}
              />
            ) : (
              <GeneratePanel onSavedToLibrary={handleSavedToLibrary} />
            )}
          </>
        )}

        {error && !showFavorites && !showLibrary && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {activeTab === 0 && currentSearch && !showFavorites && !showLibrary && (
          <AISuggestions suggestions={aiSuggestions} loading={aiLoading} />
        )}

        {showLibrary && (
          <Box sx={{ mb: 4, minHeight: 'calc(100vh - 230px)', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              📚 My Library ({librarySnippets.length})
            </Typography>
            {!isAuthenticated ? (
              <Typography color="text.secondary">Log in to view snippets you saved.</Typography>
            ) : libraryLoading ? (
              <Typography color="text.secondary">Loading your library...</Typography>
            ) : librarySnippets.length === 0 ? (
              <Box sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Your library is empty
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate code with AI and click &quot;Save to Library&quot;, or create snippets while logged in.
                </Typography>
              </Box>
            ) : (
              <SnippetList
                snippets={librarySnippets}
                loading={false}
                error={libraryError}
                pagination={null}
                onRate={handleRate}
              />
            )}
          </Box>
        )}

        {showFavorites && (
          <Box sx={{ mb: 4, minHeight: 'calc(100vh - 230px)', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              ❤️ My Favorites ({favorites.length})
            </Typography>
            {favorites.length === 0 ? (
              <Box sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
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

        {!showFavorites && !showLibrary && activeTab === 0 && (
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

        {!showFavorites && !showLibrary && activeTab === 0 && <AnalyticsSection />}
      </Container>

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

export default Home;
