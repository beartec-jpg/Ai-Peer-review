// components/AnswerDisplay.tsx
import { Result } from '@/lib/types'; // Import your Result type (e.g., { query, initials, finals, ratings, aggregatedScores, bestAnswer })

interface AnswerDisplayProps {
  result: Result;
}

export default function AnswerDisplay({ result }: AnswerDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Best Answer Highlight */}
      <section className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-l-4 border-green-500">
        <h2 className="text-2xl font-bold mb-2 text-green-800 dark:text-green-200">Best Peer-Reviewed Answer</h2>
        <p className="text-sm text-green-600 dark:text-green-400 mb-4">
          Selected based on aggregated ratings (avg score: {Math.max(...Object.values(result.aggregatedScores)).toFixed(1)}/10)
        </p>
        <div className="prose dark:prose-invert max-w-none">
          <div className="code-block">{result.bestAnswer}</div> {/* Uses global .code-block class */}
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
