// app/review/[id]/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getReviewById } from '@/lib/reviews';
import Link from 'next/link';

export default async function ReviewDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session || !session.user?.email) {
    redirect('/auth/signin');
  }

  const params = await props.params;
  const review = await getReviewById(params.id, session.user.email);

  if (!review) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Review not found
          </h2>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                ← Back to dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(review.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Code Review Details
          </h2>

          {/* Submitted Code */}
          <div className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Submitted Code
            </h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto">
              <code className="text-sm text-gray-900 dark:text-gray-100">
                {review.code}
              </code>
            </pre>
          </div>

          {/* Three Personality Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Critical Review */}
            <div className="bg-red-50 dark:bg-red-900/20 shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">
                  Critical Grok
                </h3>
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {review.reviews.critical}
              </div>
            </div>

            {/* Supportive Review */}
            <div className="bg-green-50 dark:bg-green-900/20 shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-300">
                  Supportive Grok
                </h3>
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {review.reviews.supportive}
              </div>
            </div>

            {/* Technical Review */}
            <div className="bg-blue-50 dark:bg-blue-900/20 shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                  Technical Grok
                </h3>
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {review.reviews.technical}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
