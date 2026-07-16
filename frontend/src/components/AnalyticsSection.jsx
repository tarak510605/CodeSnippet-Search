/**
 * AnalyticsSection Component
 * Search analytics dashboard for the home page
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { analyticsApi } from '../services';

function AnalyticsSection() {
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsApi.getSearches();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!analytics || analytics.totalSearches === 0) {
    return null;
  }

  const topFive = analytics.topQueries.slice(0, 5);
  const maxCount = topFive[0]?.count || 1;
  const topSearch = analytics.topQueries[0]?.query || 'N/A';
  const aiPercent = Math.round(analytics.aiUsageRate * 100);

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Analytics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Searches (7d)
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {analytics.totalSearches}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AutoAwesomeIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  AI Usage Rate
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {aiPercent}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SearchIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  Top Search
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={600} noWrap>
                {topSearch}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Top 5 Searches
      </Typography>
      <List>
        {topFive.map((item, index) => (
          <ListItem key={item.query} sx={{ flexDirection: 'column', alignItems: 'stretch', px: 0 }}>
            <ListItemText
              primary={`${index + 1}. ${item.query}`}
              secondary={`${item.count} searches`}
            />
            <LinearProgress
              variant="determinate"
              value={(item.count / maxCount) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default AnalyticsSection;
