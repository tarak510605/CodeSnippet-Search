/**
 * SnippetCard Component
 * Displays a single code snippet with preview, rating, and actions
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Rating,
  IconButton,
  Tooltip,
  Collapse,
  Button,
  Snackbar,
  Alert,
  Modal,
  Paper,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useFavorites } from '../context';

// Language display names and syntax highlighter mappings
const LANGUAGE_MAP = {
  javascript: { name: 'JavaScript', syntax: 'javascript' },
  typescript: { name: 'TypeScript', syntax: 'typescript' },
  python: { name: 'Python', syntax: 'python' },
  java: { name: 'Java', syntax: 'java' },
  go: { name: 'Go', syntax: 'go' },
  rust: { name: 'Rust', syntax: 'rust' },
  cpp: { name: 'C++', syntax: 'cpp' },
  csharp: { name: 'C#', syntax: 'csharp' },
  ruby: { name: 'Ruby', syntax: 'ruby' },
  php: { name: 'PHP', syntax: 'php' },
  sql: { name: 'SQL', syntax: 'sql' },
  bash: { name: 'Bash', syntax: 'bash' },
  css: { name: 'CSS', syntax: 'css' },
  html: { name: 'HTML', syntax: 'html' },
  json: { name: 'JSON', syntax: 'json' },
  yaml: { name: 'YAML', syntax: 'yaml' },
};

// Maximum lines to show in preview
const PREVIEW_LINES = 12;

function SnippetCard({ snippet, onRate }) {
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { isFavorite, toggleFavorite } = useFavorites();

  const {
    _id,
    title,
    language,
    tags,
    code,
    description,
    ratings,
    favoritesCount,
  } = snippet;

  const isFav = isFavorite(_id);
  const languageInfo = LANGUAGE_MAP[language] || { name: language, syntax: language };
  const codeLines = code.split('\n');
  const needsExpand = codeLines.length > PREVIEW_LINES;
  const previewCode = needsExpand && !expanded
    ? codeLines.slice(0, PREVIEW_LINES).join('\n') + '\n// ...'
    : code;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setSnackbar({ open: true, message: 'Code copied to clipboard!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to copy code', severity: 'error' });
    }
  };

  const handleRating = async (event, newValue) => {
    if (newValue && onRate) {
      try {
        await onRate(_id, newValue);
        setUserRating(newValue);
        setSnackbar({ open: true, message: 'Rating submitted!', severity: 'success' });
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to submit rating', severity: 'error' });
      }
    }
  };

  const handleFavorite = () => {
    const isNowFavorite = toggleFavorite(snippet);
    setSnackbar({
      open: true,
      message: isNowFavorite ? 'Added to favorites!' : 'Removed from favorites',
      severity: 'success',
    });
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'box-shadow 0.2s, transform 0.2s',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Header: Title and Language */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {title}
            </Typography>
            <Chip
              label={languageInfo.name}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 1, flexShrink: 0 }}
            />
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </Typography>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {tags.slice(0, 5).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="filled"
                  sx={{
                    bgcolor: 'action.hover',
                    fontSize: '0.75rem',
                    height: 24,
                  }}
                />
              ))}
              {tags.length > 5 && (
                <Chip
                  label={`+${tags.length - 5}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 24 }}
                />
              )}
            </Box>
          )}

          {/* Code Preview */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              maxHeight: expanded ? 'none' : 300,
            }}
          >
            <SyntaxHighlighter
              language={languageInfo.syntax}
              style={oneDark}
              customStyle={{
                margin: 0,
                borderRadius: 8,
                fontSize: '0.8rem',
                padding: '1rem',
              }}
              showLineNumbers
              wrapLines
            >
              {previewCode}
            </SyntaxHighlighter>

            {/* Copy Button */}
            <Tooltip title="Copy code">
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Expand/Collapse Button */}
          {needsExpand && (
            <Button
              size="small"
              onClick={() => setModalOpen(true)}
              endIcon={<FullscreenIcon />}
              sx={{ mt: 1, textTransform: 'none' }}
            >
              View all {codeLines.length} lines
            </Button>
          )}
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              value={userRating || ratings?.average || 0}
              precision={0.5}
              onChange={handleRating}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              ({ratings?.count || 0})
            </Typography>
          </Box>

          {/* Favorite and View */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton size="small" onClick={handleFavorite} color={isFav ? 'error' : 'default'}>
                {isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24 }}>
              {favoritesCount || 0}
            </Typography>
          </Box>
        </CardActions>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

      {/* Full Code Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="code-modal-title"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: '80%' },
            maxWidth: 1000,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default',
            }}
          >
            <Box>
              <Typography id="code-modal-title" variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip label={languageInfo.name} size="small" color="primary" variant="outlined" />
                <Typography variant="body2" color="text.secondary">
                  {codeLines.length} lines
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Copy code">
                <IconButton onClick={handleCopy} size="small">
                  <CopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton onClick={() => setModalOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Modal Code Content */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              maxHeight: 'calc(90vh - 100px)',
            }}
          >
            <SyntaxHighlighter
              language={languageInfo.syntax}
              style={oneDark}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: '0.85rem',
                padding: '1.5rem',
                minHeight: '100%',
              }}
              showLineNumbers
              wrapLines
            >
              {code}
            </SyntaxHighlighter>
          </Box>
        </Paper>
      </Modal>
    </>
  );
}

export default SnippetCard;
