// lib/history-service.ts
// File-based storage service for query history (can be replaced with database)

import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import type { QueryHistory, Result, HistoryFilter } from './types';

// Configuration
const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const MAX_HISTORY_PER_USER = parseInt(process.env.MAX_HISTORY_PER_USER || '100', 10);

// In-memory cache for faster access
let historyCache: QueryHistory[] | null = null;

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
};

// Load history from file
const loadHistory = async (): Promise<QueryHistory[]> => {
  if (historyCache !== null) {
    return historyCache;
  }

  try {
    await ensureDataDir();
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    historyCache = JSON.parse(data);
    return historyCache || [];
  } catch {
    // File doesn't exist or is invalid, return empty array
    historyCache = [];
    return historyCache;
  }
};

// Save history to file
const saveHistory = async (history: QueryHistory[]): Promise<void> => {
  try {
    await ensureDataDir();
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
    historyCache = history;
  } catch (error) {
    console.error('Failed to save history:', error);
    throw new Error('Failed to save history');
  }
};

// Add query to history
export const addToHistory = async (
  query: string,
  result: Result,
  userId: string = 'default',
  cacheHit: boolean = false
): Promise<QueryHistory> => {
  const history = await loadHistory();
  
  const entry: QueryHistory = {
    id: uuidv4(),
    query,
    result,
    userId,
    timestamp: Date.now(),
    cacheHit,
  };

  // Add to beginning (most recent first)
  history.unshift(entry);

  // Trim to max per user
  const userHistory = history.filter(h => h.userId === userId);
  if (userHistory.length > MAX_HISTORY_PER_USER) {
    // Remove oldest entries for this user
    const toRemove = userHistory.slice(MAX_HISTORY_PER_USER);
    const removeIds = new Set(toRemove.map(h => h.id));
    const trimmed = history.filter(h => !removeIds.has(h.id));
    await saveHistory(trimmed);
  } else {
    await saveHistory(history);
  }

  return entry;
};

// Get all history for a user
export const getUserHistory = async (
  userId: string = 'default',
  filter?: HistoryFilter
): Promise<QueryHistory[]> => {
  const history = await loadHistory();
  let userHistory = history.filter(h => h.userId === userId);

  // Apply filters
  if (filter) {
    if (filter.startDate !== undefined) {
      const startDate = filter.startDate;
      userHistory = userHistory.filter(h => h.timestamp >= startDate);
    }
    if (filter.endDate !== undefined) {
      const endDate = filter.endDate;
      userHistory = userHistory.filter(h => h.timestamp <= endDate);
    }
    if (filter.minScore !== undefined) {
      const minScore = filter.minScore;
      userHistory = userHistory.filter(h => {
        const maxScore = Math.max(...Object.values(h.result.aggregatedScores));
        return maxScore >= minScore;
      });
    }
    if (filter.maxScore !== undefined) {
      const maxScore = filter.maxScore;
      userHistory = userHistory.filter(h => {
        const score = Math.max(...Object.values(h.result.aggregatedScores));
        return score <= maxScore;
      });
    }
    if (filter.searchQuery) {
      const searchLower = filter.searchQuery.toLowerCase();
      userHistory = userHistory.filter(h =>
        h.query.toLowerCase().includes(searchLower) ||
        h.result.bestAnswer.toLowerCase().includes(searchLower)
      );
    }
  }

  return userHistory;
};

// Get specific history entry by ID
export const getHistoryById = async (
  id: string,
  userId: string = 'default'
): Promise<QueryHistory | null> => {
  const history = await loadHistory();
  const entry = history.find(h => h.id === id && h.userId === userId);
  return entry || null;
};

// Delete history entry
export const deleteHistoryEntry = async (
  id: string,
  userId: string = 'default'
): Promise<boolean> => {
  const history = await loadHistory();
  const filtered = history.filter(h => !(h.id === id && h.userId === userId));
  
  if (filtered.length === history.length) {
    return false; // Entry not found
  }

  await saveHistory(filtered);
  return true;
};

// Clear all history for a user
export const clearUserHistory = async (userId: string = 'default'): Promise<void> => {
  const history = await loadHistory();
  const filtered = history.filter(h => h.userId !== userId);
  await saveHistory(filtered);
};

// Get history statistics for a user
export const getHistoryStats = async (userId: string = 'default') => {
  const history = await getUserHistory(userId);
  
  const totalQueries = history.length;
  const cacheHits = history.filter(h => h.cacheHit).length;
  const cacheMisses = totalQueries - cacheHits;
  
  const scores = history.map(h => Math.max(...Object.values(h.result.aggregatedScores)));
  const avgScore = scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;
  
  const modelPerformance: Record<string, { count: number; avgScore: number }> = {};
  history.forEach(h => {
    Object.entries(h.result.aggregatedScores).forEach(([model, score]) => {
      if (!modelPerformance[model]) {
        modelPerformance[model] = { count: 0, avgScore: 0 };
      }
      modelPerformance[model].count++;
      modelPerformance[model].avgScore += score;
    });
  });
  
  Object.keys(modelPerformance).forEach(model => {
    modelPerformance[model].avgScore /= modelPerformance[model].count;
  });

  return {
    totalQueries,
    cacheHits,
    cacheMisses,
    cacheHitRate: totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0,
    avgScore: Math.round(avgScore * 100) / 100,
    modelPerformance,
  };
};
