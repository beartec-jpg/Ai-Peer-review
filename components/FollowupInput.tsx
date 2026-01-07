// components/FollowupInput.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FollowupInputProps {
  onSubmit: (followupQuery: string) => void;
  isLoading: boolean;
  estimatedCost: number;
  followupCount: number;
  maxFollowups: number;
  suggestions?: string[];
}

interface FormData {
  followupQuery: string;
}

export default function FollowupInput({
  onSubmit,
  isLoading,
  estimatedCost,
  followupCount,
  maxFollowups,
  suggestions = [],
}: FollowupInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { followupQuery: '' },
  });

  const onFormSubmit = (data: FormData) => {
    onSubmit(data.followupQuery);
    reset();
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue('followupQuery', suggestion);
    setShowSuggestions(false);
  };

  const remainingFollowups = maxFollowups - followupCount;
  const isLimitReached = remainingFollowups <= 0;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200">
            Ask a Follow-up Question
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Get more insights from {followupCount > 0 ? 'the same model' : 'the best model'} with full context
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            ~${estimatedCost.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            (vs ~$3.00 full re-run)
          </div>
        </div>
      </div>

      {/* Follow-up counter */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Follow-ups used: {followupCount}/{maxFollowups}
        {remainingFollowups <= 2 && remainingFollowups > 0 && (
          <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
            ({remainingFollowups} remaining)
          </span>
        )}
        {isLimitReached && (
          <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
            (Limit reached)
          </span>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && !isLimitReached && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Suggested questions:
          </p>
          <div className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="block w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                disabled={isLoading}
              >
                💡 {suggestion}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowSuggestions(false)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2"
          >
            Hide suggestions
          </button>
        </div>
      )}

      {/* Follow-up form */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <textarea
            {...register('followupQuery', {
              required: 'Follow-up question is required',
              minLength: { value: 5, message: 'Question too short (min 5 chars)' },
            })}
            rows={3}
            placeholder="e.g., 'How do I handle cleanup in this hook?' or 'Can you add error handling?'"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
            disabled={isLoading || isLimitReached}
          />
          {errors.followupQuery && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.followupQuery.message}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isLimitReached || !!errors.followupQuery}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              'Submit Follow-up'
            )}
          </button>
          
          {!showSuggestions && suggestions.length > 0 && !isLimitReached && (
            <button
              type="button"
              onClick={() => setShowSuggestions(true)}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              disabled={isLoading}
            >
              💡 Show suggestions
            </button>
          )}
        </div>
      </form>

      {isLimitReached && (
        <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 rounded text-sm">
          You&apos;ve reached the maximum number of follow-ups for this query. Start a new query to continue exploring.
        </div>
      )}
    </div>
  );
}
