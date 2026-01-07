// components/HistorySidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import type { QueryHistory } from '@/lib/types';

interface HistorySidebarProps {
  onSelectHistory: (history: QueryHistory) => void;
  userId?: string;
}

export default function HistorySidebar({ onSelectHistory, userId = 'default' }: HistorySidebarProps) {
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({ userId });
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/history?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data = await response.json();
      setHistory(data.history || []);
    } catch {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, searchQuery]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this history entry?')) return;

    try {
      const response = await fetch(`/api/history/${id}?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      
      // Refresh history
      fetchHistory();
    } catch {
      alert('Failed to delete entry');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMaxScore = (history: QueryHistory) => {
    return Math.max(...Object.values(history.result.aggregatedScores));
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg"
      >
        {isOpen ? '✕' : '📜'}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:sticky top-0 right-0 h-screen w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold dark:text-white">Query History</h2>
            <button
              onClick={fetchHistory}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              title="Refresh"
            >
              🔄
            </button>
          </div>

          {/* Search box */}
          <input
            type="text"
            placeholder="Search queries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />

          {loading && (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          )}

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No history yet. Submit a query to get started!
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistory(item);
                    setIsOpen(false); // Close on mobile after selection
                  }}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.query.substring(0, 50)}
                        {item.query.length > 50 ? '...' : ''}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="ml-2 text-red-500 hover:text-red-700 text-xs"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(item.timestamp)}</span>
                    <span className="px-2 py-0.5 bg-yellow-200 dark:bg-yellow-800 rounded font-medium">
                      {getMaxScore(item).toFixed(1)}/10
                    </span>
                  </div>
                  
                  {item.cacheHit && (
                    <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                      ⚡ Cached
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {history.length > 0 && (
            <button
              onClick={async () => {
                if (!confirm('Clear all history?')) return;
                try {
                  const response = await fetch(`/api/history?userId=${userId}`, {
                    method: 'DELETE',
                  });
                  if (response.ok) {
                    fetchHistory();
                  }
                } catch {
                  alert('Failed to clear history');
                }
              }}
              className="w-full mt-4 p-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg"
            >
              Clear All History
            </button>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
