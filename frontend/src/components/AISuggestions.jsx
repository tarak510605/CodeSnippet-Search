/**
 * AISuggestions Component
 * Displays AI-generated suggestions alongside search results
 */

import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Divider,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  AutoAwesome as AiIcon,
  Lightbulb as IdeaIcon,
  Warning as WarningIcon,
  Code as CodeIcon,
  Star as StarIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  TipsAndUpdates as TipIcon,
} from '@mui/icons-material';

function AISuggestions({ suggestions, loading }) {
  const [expanded, setExpanded] = useState(true);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    improvements: true,
    edgeCases: true,
    alternatives: true,
    newSnippet: false,
  });

  const toggleSection = (section) => {
    setSectionsExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Loading state
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'secondary.light',
          bgcolor: 'rgba(124, 58, 237, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AiIcon color="secondary" />
          <Typography variant="h6" color="secondary">
            AI is analyzing...
          </Typography>
        </Box>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 2 }} />
      </Paper>
    );
  }

  // No AI data
  if (!suggestions || !suggestions.available) {
    if (suggestions?.message) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          {suggestions.message}
        </Alert>
      );
    }
    return null;
  }

  const aiData = suggestions.suggestions;

  // Handle raw/unparsed response
  if (aiData?.raw) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'secondary.light',
          bgcolor: 'rgba(124, 58, 237, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AiIcon color="secondary" />
          <Typography variant="h6" color="secondary">
            AI Analysis
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {aiData.summary}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'secondary.light',
        bgcolor: 'rgba(124, 58, 237, 0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.08)' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AiIcon color="secondary" />
          <Typography variant="h6" color="secondary" sx={{ fontWeight: 600 }}>
            AI Insights
          </Typography>
          <Chip
            label="Powered by AI"
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Box>
        <IconButton size="small">
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 3, pb: 3 }}>
          {/* Summary */}
          {aiData?.summary && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary">
                {aiData.summary}
              </Typography>
            </Box>
          )}

          {/* Best Match */}
          {aiData?.bestMatch && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: 'success.lighter',
                border: '1px solid',
                borderColor: 'success.light',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StarIcon color="success" fontSize="small" />
                <Typography variant="subtitle2" color="success.dark">
                  Best Match: Snippet #{aiData.bestMatch.index}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {aiData.bestMatch.reason}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Improvements */}
          {aiData?.improvements && aiData.improvements.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  py: 1,
                }}
                onClick={() => toggleSection('improvements')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IdeaIcon color="warning" fontSize="small" />
                  <Typography variant="subtitle2">
                    Suggested Improvements ({aiData.improvements.length})
                  </Typography>
                </Box>
                <IconButton size="small">
                  {sectionsExpanded.improvements ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Collapse in={sectionsExpanded.improvements}>
                <List dense>
                  {aiData.improvements.map((imp, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Chip
                          label={imp.priority}
                          size="small"
                          color={
                            imp.priority === 'high' ? 'error' :
                            imp.priority === 'medium' ? 'warning' : 'default'
                          }
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Snippet #${imp.snippetIndex}`}
                        secondary={imp.suggestion}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          )}

          {/* Missing Edge Cases */}
          {aiData?.missingEdgeCases && aiData.missingEdgeCases.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  py: 1,
                }}
                onClick={() => toggleSection('edgeCases')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="error" fontSize="small" />
                  <Typography variant="subtitle2">
                    Missing Edge Cases ({aiData.missingEdgeCases.length})
                  </Typography>
                </Box>
                <IconButton size="small">
                  {sectionsExpanded.edgeCases ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Collapse in={sectionsExpanded.edgeCases}>
                <List dense>
                  {aiData.missingEdgeCases.map((edgeCase, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Typography variant="body2" color="text.secondary">
                          •
                        </Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={edgeCase}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          )}

          {/* Alternative Approaches */}
          {aiData?.alternativeApproaches && aiData.alternativeApproaches.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  py: 1,
                }}
                onClick={() => toggleSection('alternatives')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TipIcon color="info" fontSize="small" />
                  <Typography variant="subtitle2">
                    Alternative Approaches ({aiData.alternativeApproaches.length})
                  </Typography>
                </Box>
                <IconButton size="small">
                  {sectionsExpanded.alternatives ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Collapse in={sectionsExpanded.alternatives}>
                <List dense>
                  {aiData.alternativeApproaches.map((alt, index) => (
                    <ListItem key={index} sx={{ py: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {alt.approach}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {alt.tradeoffs}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          )}

          {/* New Snippet Suggestion */}
          {aiData?.additionalSnippetSuggestion && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  py: 1,
                }}
                onClick={() => toggleSection('newSnippet')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2">
                    Suggested New Snippet
                  </Typography>
                </Box>
                <IconButton size="small">
                  {sectionsExpanded.newSnippet ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Collapse in={sectionsExpanded.newSnippet}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {aiData.additionalSnippetSuggestion.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {aiData.additionalSnippetSuggestion.description}
                  </Typography>
                  {aiData.additionalSnippetSuggestion.pseudocode && (
                    <Box
                      component="pre"
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        fontSize: '0.8rem',
                        overflow: 'auto',
                      }}
                    >
                      {aiData.additionalSnippetSuggestion.pseudocode}
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default AISuggestions;
