// app/page.tsx
'use client'; // Enables client-side features (hooks, state)

import { useState } from 'react';
import QueryForm from '@/components/QueryForm';
import AnswerDisplay from '@/components/AnswerDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
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

      {result && <AnswerDisplay result={result} />}
    </div>
  );
}
