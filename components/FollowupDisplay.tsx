// components/FollowupDisplay.tsx
import type { FollowupResult } from '@/lib/types';

interface FollowupDisplayProps {
  followups: FollowupResult[];
}

export default function FollowupDisplay({ followups }: FollowupDisplayProps) {
  if (followups.length === 0) return null;

  return (
    <section className="mt-8 space-y-6">
      <div className="border-t-2 border-gray-300 dark:border-gray-700 pt-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Follow-up Conversation ({followups.length})
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Iterative exploration with {followups[0]?.model || 'the best model'} maintaining full context
        </p>
      </div>

      {followups.map((followup, idx) => (
        <div
          key={followup.timestamp}
          className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-l-4 border-purple-500"
        >
          {/* Header with follow-up number and metadata */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-sm">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                  Follow-up Question
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(followup.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {followup.model}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                Cost: ~${followup.estimatedCost.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ❓ Question:
            </div>
            <div className="text-gray-900 dark:text-white">
              {followup.followupQuery}
            </div>
          </div>

          {/* Answer */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              💡 Answer:
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <div className="code-block">{followup.answer}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Summary stats */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">
            Total follow-ups: <strong>{followups.length}</strong>
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            Total cost: <strong className="text-green-600 dark:text-green-400">
              ~${followups.reduce((sum, f) => sum + f.estimatedCost, 0).toFixed(2)}
            </strong>
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            Savings: <strong className="text-green-600 dark:text-green-400">
              ~${(followups.length * 3.0 - followups.reduce((sum, f) => sum + f.estimatedCost, 0)).toFixed(2)}
            </strong>
          </span>
        </div>
      </div>
    </section>
  );
}
