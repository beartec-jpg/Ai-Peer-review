// app/page.tsx
'use client'; // Enables client-side features (hooks, state)

import { useState } from 'react';
import QueryForm from '@/components/QueryForm';
import AnswerDisplay from '@/components/AnswerDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import HistorySidebar from '@/components/HistorySidebar';
import type { QueryHistory } from '@/lib/types';

export default function HomePage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const handleSubmit = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setFromCache(false);
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, userId: 'default' }),
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setResult(data);
      setFromCache(data.fromCache || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (history: QueryHistory) => {
    setResult(history.result);
    setError(null);
    setFromCache(history.cacheHit);
    // Scroll to top to show result
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen">
      {/* Main content */}
      <div className="flex-1 container mx-auto max-w-4xl p-6">
        <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">
          Peer AI Reviewer
        </h1>
        <p className="text-center text-lg mb-8 text-gray-600 dark:text-gray-300">
          Submit a coding query for multi-model peer-reviewed answers.
        </p>

        <QueryForm onSubmit={handleSubmit} />

        {loading && (
          <div className="flex justify-center mt-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
            Error: {error}
          </div>
        )}

        {fromCache && result && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm flex items-center">
            <span className="mr-2">⚡</span>
            <span>Loaded from cache - no API calls made!</span>
          </div>
        )}

        {result && <AnswerDisplay result={result} />}
      </div>

      {/* History sidebar */}
      <HistorySidebar onSelectHistory={handleSelectHistory} userId="default" />
    </div>
  );
}
