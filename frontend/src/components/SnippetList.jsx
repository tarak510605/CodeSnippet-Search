/**
 * SnippetList Component
 * Displays a grid of snippet cards with pagination
 */

import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Pagination,
  Skeleton,
  Alert,
} from '@mui/material';
import { SearchOff as NoResultsIcon } from '@mui/icons-material';
import SnippetCard from './SnippetCard';

function SnippetList({ snippets, loading, error, pagination, onPageChange, onRate, onFavorite }) {
  // Loading state with skeleton cards
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid item xs={12} md={6} key={i}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton variant="rounded" width={60} height={24} />
                <Skeleton variant="rounded" width={60} height={24} />
                <Skeleton variant="rounded" width={60} height={24} />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  // Empty state
  if (!snippets || snippets.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          color: 'text.secondary',
        }}
      >
        <NoResultsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
        <Typography variant="h6">No snippets found</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Try adjusting your search query or filters
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Results Count */}
      {pagination && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {snippets.length} of {pagination.totalCount} results
        </Typography>
      )}

      {/* Snippet Grid */}
      <Grid container spacing={3}>
        {snippets.map((snippet) => (
          <Grid item xs={12} md={6} key={snippet._id}>
            <SnippetCard
              snippet={snippet}
              onRate={onRate}
              onFavorite={onFavorite}
            />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={(e, page) => onPageChange?.(page)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}

export default SnippetList;
