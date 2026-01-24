/**
 * SearchBar Component
 * Main search input with filters and options
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Collapse,
  Button,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  AutoAwesome as AiIcon,
} from '@mui/icons-material';

// Supported programming languages
const LANGUAGES = [
  { value: '', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'css', label: 'CSS' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'score', label: 'Best Match' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'favorites', label: 'Most Favorited' },
  { value: 'recent', label: 'Most Recent' },
];

function SearchBar({ onSearch, loading = false }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    language: '',
    sortBy: 'score',
    includeAI: false,  // Disabled by default to avoid rate limit errors
  });

  const handleSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      onSearch({
        query: query.trim(),
        ...filters,
      });
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Main Search Input */}
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for code snippets using natural language... (e.g., 'debounce function in javascript')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.default',
            },
          }}
        />

        {/* Filter toggle - only show on mobile */}
        {!isDesktop && (
          <Tooltip title="Toggle Filters">
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? 'primary' : 'default'}
              sx={{
                border: '1px solid',
                borderColor: showFilters ? 'primary.main' : 'divider',
                borderRadius: 2,
              }}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          sx={{ minWidth: 120, height: 56 }}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </Box>

      {/* Filters Section - Always visible on desktop, collapsible on mobile */}
      <Collapse in={isDesktop || showFilters}>
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Language Filter */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={filters.language}
                label="Language"
                onChange={(e) => handleFilterChange('language', e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort By */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* AI Toggle */}
            <Chip
              icon={<AiIcon />}
              label="AI Suggestions"
              onClick={() => handleFilterChange('includeAI', !filters.includeAI)}
              color={filters.includeAI ? 'primary' : 'default'}
              variant={filters.includeAI ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
          </Box>

          {/* Active Filters Display */}
          {(filters.language || filters.sortBy !== 'score') && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Active filters:
              </Typography>
              {filters.language && (
                <Chip
                  size="small"
                  label={LANGUAGES.find((l) => l.value === filters.language)?.label}
                  onDelete={() => handleFilterChange('language', '')}
                />
              )}
              {filters.sortBy !== 'score' && (
                <Chip
                  size="small"
                  label={`Sort: ${SORT_OPTIONS.find((s) => s.value === filters.sortBy)?.label}`}
                  onDelete={() => handleFilterChange('sortBy', 'score')}
                />
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default SearchBar;
