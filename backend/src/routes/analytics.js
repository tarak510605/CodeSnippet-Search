/**
 * Analytics Routes
 * Search analytics and usage statistics
 */

import { Router } from 'express';
import SearchLog from '../models/SearchLog.js';
import { asyncHandler } from '../utils/index.js';

const router = Router();

/**
 * @route   GET /api/analytics/searches
 * @desc    Search analytics for the last 7 days
 */
router.get(
  '/searches',
  asyncHandler(async (req, res) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const matchStage = { createdAt: { $gte: sevenDaysAgo } };

    const [
      topQueries,
      totals,
      searchesPerDay,
      usageStats
    ] = await Promise.all([
      SearchLog.aggregate([
        { $match: matchStage },
        { $group: { _id: '$query', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, query: '$_id', count: 1 } }
      ]),
      SearchLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalSearches: { $sum: 1 },
            averageResults: { $avg: '$resultCount' },
            aiCount: { $sum: { $cond: ['$usedAI', 1, 0] } },
            semanticCount: { $sum: { $cond: ['$usedSemanticSearch', 1, 0] } }
          }
        }
      ]),
      SearchLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1 } }
      ]),
      SearchLog.countDocuments(matchStage)
    ]);

    const stats = totals[0] || {
      totalSearches: 0,
      averageResults: 0,
      aiCount: 0,
      semanticCount: 0
    };

    const totalSearches = stats.totalSearches || 0;
    const aiUsageRate = totalSearches > 0 ? stats.aiCount / totalSearches : 0;
    const semanticUsageRate = totalSearches > 0 ? stats.semanticCount / totalSearches : 0;

    res.status(200).json({
      success: true,
      data: {
        topQueries,
        totalSearches,
        averageResults: Math.round((stats.averageResults || 0) * 10) / 10,
        searchesPerDay,
        aiUsageRate: Math.round(aiUsageRate * 1000) / 1000,
        semanticUsageRate: Math.round(semanticUsageRate * 1000) / 1000
      }
    });
  })
);

export default router;
