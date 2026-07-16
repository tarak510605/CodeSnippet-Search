/**
 * GeneratePanel Component
 * AI code snippet generation UI
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  Chip,
  Paper,
  Skeleton,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { AutoAwesome as GenerateIcon } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { snippetApi } from '../services';
import { useAuth } from '../context';

const LANGUAGE_SYNTAX = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php',
  swift: 'swift',
  kotlin: 'kotlin',
  scala: 'scala',
  html: 'html',
  css: 'css',
  sql: 'sql',
  bash: 'bash',
  powershell: 'powershell',
  yaml: 'yaml',
  json: 'json',
  markdown: 'markdown',
  other: 'javascript',
};

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'html',
  'css', 'sql', 'bash', 'powershell', 'yaml', 'json', 'markdown', 'other'
];

function GeneratePanel({ onSavedToLibrary }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', action: null });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGenerate = async () => {
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await snippetApi.generate(description.trim(), language);
      setGenerated(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed');
      setGenerated(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to save snippets',
        action: 'login',
      });
      return;
    }

    try {
      const descriptionText =
        generated.description?.length >= 10
          ? generated.description
          : `${generated.description || generated.title}. Saved from AI generator.`;

      await snippetApi.create({
        title: generated.title,
        language: generated.language || language,
        code: generated.code,
        description: descriptionText,
        tags: generated.tags || [],
      });
      setError('');
      setSaveSuccess(true);
      setSnackbar({
        open: true,
        message: 'Saved to your library!',
        action: 'library',
      });
      onSavedToLibrary?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save snippet');
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        minRows={4}
        label="Describe what you need..."
        placeholder='e.g. "a Python function that retries failed API calls with exponential backoff"'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Language</InputLabel>
        <Select
          value={language}
          label="Language"
          onChange={(e) => setLanguage(e.target.value)}
          disabled={loading}
        >
          {LANGUAGES.map((lang) => (
            <MenuItem key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleGenerate}
        disabled={loading || description.trim().length < 10}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GenerateIcon />}
        sx={{ mb: 3 }}
      >
        {loading ? 'Generating...' : 'Generate Snippet'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="rectangular" height={200} sx={{ my: 2, borderRadius: 2 }} />
          <Skeleton variant="text" />
        </Box>
      )}

      {!loading && generated && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            {generated.title}
          </Typography>
          <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
            <SyntaxHighlighter
              language={
                LANGUAGE_SYNTAX[generated.language || language] ||
                generated.language ||
                language ||
                'javascript'
              }
              style={oneDark}
              customStyle={{
                margin: 0,
                borderRadius: 8,
                fontSize: '0.85rem',
                padding: '1rem',
              }}
              showLineNumbers
            >
              {generated.code}
            </SyntaxHighlighter>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {generated.description}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {(generated.tags || []).map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleSave}>
              Save to Library
            </Button>
            <Button variant="outlined" onClick={handleGenerate}>
              Regenerate
            </Button>
          </Box>
        </Paper>
      )}

      {saveSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Snippet saved. Open <strong>My Library</strong> in the header to view it anytime.
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: '', action: null })}
        message={snackbar.message}
        action={
          snackbar.action === 'login' ? (
            <Button color="inherit" size="small" onClick={() => navigate('/login')}>
              Login
            </Button>
          ) : snackbar.action === 'library' ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setSnackbar({ open: false, message: '', action: null });
                onSavedToLibrary?.(true);
              }}
            >
              View Library
            </Button>
          ) : null
        }
      />
    </Box>
  );
}

export default GeneratePanel;
