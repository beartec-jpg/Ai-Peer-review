// components/AnswerDisplay.tsx
import { Result } from '@/lib/types';

interface AnswerDisplayProps {
  result: Result;
  onFollowupClick?: () => void;
}

export default function AnswerDisplay({ result, onFollowupClick }: AnswerDisplayProps) {
  const bestScore = Math.max(...Object.values(result.aggregatedScores));
  const bestModelName = result.bestModel 
    ? result.bestModel.charAt(0).toUpperCase() + result.bestModel.slice(1)
    : 'Unknown';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Best Answer Highlight */}
      <section className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-l-4 border-green-500">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
            Best Peer-Reviewed Answer
          </h2>
          {onFollowupClick && (
            <button
              onClick={onFollowupClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <span>💬</span>
              Ask Follow-up
            </button>
          )}
        </div>
        <p className="text-sm text-green-600 dark:text-green-400 mb-2">
          <strong>{bestModelName}</strong> selected based on aggregated ratings (avg score: {bestScore.toFixed(1)}/10)
        </p>
        <p className="text-xs text-green-600 dark:text-green-400 mb-4">
          Want to dig deeper? Click &quot;Ask Follow-up&quot; to explore this answer further with the same model maintaining full context.
        </p>
        <div className="prose dark:prose-invert max-w-none">
          <div className="code-block">{result.bestAnswer}</div>
        </div>
      </section>

      {/* Initial Answers */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Initial Answers</h3>
        {result.initials.map((answer) => (
          <div key={answer.model} className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-blue-600 dark:text-blue-400">{answer.model}&apos;s Initial Response</h4>
            <div className="code-block mt-2">{answer.content}</div>
          </div>
        ))}
      </section>

      {/* Final Reviewed Answers */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Peer-Reviewed Final Answers</h3>
        {result.finals.map((answer) => {
          const score = result.aggregatedScores[answer.model.toLowerCase()];
          return (
            <div key={answer.model} className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-blue-600 dark:text-blue-400">{answer.model}&apos;s Final</h4>
                <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-xs font-bold rounded">
                  Score: {score?.toFixed(1)}/10
                </span>
              </div>
              <div className="code-block mt-2">{answer.content}</div>
            </div>
          );
        })}
      </section>

      {/* Ratings Summary */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Peer Ratings Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.ratings.map((rating) => (
            <div key={rating.fromModel} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium">{rating.fromModel}&apos;s Ratings</h4>
              <ul className="mt-2 space-y-1 text-sm">
                {Object.entries(rating.scores).map(([model, score]) => (
                  <li key={model}>
                    {model}: {score}/10
                  </li>
                ))}
              </ul>
              {rating.feedback && <p className="mt-2 text-xs italic text-gray-600 dark:text-gray-400">{rating.feedback}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
