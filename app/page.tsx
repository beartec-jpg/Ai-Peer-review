// app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import QueryForm from '@/components/QueryForm';
import AnswerDisplay from '@/components/AnswerDisplay';
import FollowupInput from '@/components/FollowupInput';
import FollowupDisplay from '@/components/FollowupDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Result, FollowupContext, FollowupResult } from '@/lib/types';
import { generateFollowupSuggestions } from '@/lib/followup-service';

const MAX_FOLLOWUPS = 5;

export default function HomePage() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Follow-up state
  const [showFollowup, setShowFollowup] = useState(false);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupError, setFollowupError] = useState<string | null>(null);
  const [followups, setFollowups] = useState<FollowupResult[]>([]);
  const [followupContext, setFollowupContext] = useState<FollowupContext | null>(null);
  const [estimatedCost, setEstimatedCost] = useState(0.51);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Ref for scrolling to follow-up section
  const followupRef = useRef<HTMLDivElement>(null);

  // Fetch cost estimate on mount
  useEffect(() => {
    fetch('/api/followup')
      .then(res => res.json())
      .then(data => setEstimatedCost(data.estimatedCost))
      .catch(err => console.error('Failed to fetch cost estimate:', err));
  }, []);

  const handleSubmit = async (query: string) => {
    if (!query.trim()) return;
    
    // Reset state for new query
    setLoading(true);
    setError(null);
    setShowFollowup(false);
    setFollowups([]);
    setFollowupContext(null);
    setFollowupError(null);
    
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error('API request failed');
      const data: Result = await response.json();
      setResult(data);
      
      // Initialize follow-up context
      const bestScore = Math.max(...Object.values(data.aggregatedScores));
      const context: FollowupContext = {
        originalQuery: data.query,
        chosenAnswer: data.bestAnswer,
        chosenModel: data.bestModel || Object.keys(data.aggregatedScores)[0],
        score: bestScore,
        followupChain: [],
      };
      setFollowupContext(context);
      
      // Generate suggestions
      const newSuggestions = generateFollowupSuggestions(context);
      setSuggestions(newSuggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowupClick = () => {
    setShowFollowup(true);
    // Scroll to follow-up section after a brief delay to allow render
    setTimeout(() => {
      followupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleFollowupSubmit = async (followupQuery: string) => {
    if (!followupContext) return;
    
    setFollowupLoading(true);
    setFollowupError(null);
    
    try {
      const response = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followupQuery,
          context: followupContext,
        }),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Follow-up request failed');
      }
      
      const data: FollowupResult = await response.json();
      
      // Add to followups list
      setFollowups(prev => [...prev, data]);
      
      // Update context for next follow-up
      setFollowupContext(data.context);
      
      // Generate new suggestions based on updated context
      const newSuggestions = generateFollowupSuggestions(data.context);
      setSuggestions(newSuggestions);
    } catch (err) {
      setFollowupError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setFollowupLoading(false);
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

      {result && (
        <>
          <AnswerDisplay result={result} onFollowupClick={handleFollowupClick} />
          
          {/* Follow-up section */}
          {showFollowup && followupContext && (
            <div ref={followupRef} className="mt-8">
              <FollowupInput
                onSubmit={handleFollowupSubmit}
                isLoading={followupLoading}
                estimatedCost={estimatedCost}
                followupCount={followups.length}
                maxFollowups={MAX_FOLLOWUPS}
                suggestions={suggestions}
              />
              
              {followupError && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
                  Error: {followupError}
                </div>
              )}
            </div>
          )}
          
          {/* Display follow-up results */}
          <FollowupDisplay followups={followups} />
        </>
      )}
    </div>
  );
}
