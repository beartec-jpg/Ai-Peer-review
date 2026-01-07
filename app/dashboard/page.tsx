// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { signOut } from '@/lib/auth';

async function getReviewHistory() {
  const session = await auth();
  if (!session) return null;

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/review/history`, {
      cache: 'no-store',
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }

  const reviews = await getReviewHistory();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Peer Review Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {session.user?.email}
              </span>
              <form action={async () => {
                'use server';
                await signOut({ redirectTo: '/auth/signin' });
              }}>
                <button
                  type="submit"
                  className="text-sm text-red-600 hover:text-red-500 dark:text-red-400"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Review History
            </h2>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              New Review
            </Link>
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {reviews.map((review: any) => (
                  <li key={review.id}>
                    <Link
                      href={`/review/${review.id}`}
                      className="block hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                            {review.codeSubmitted.substring(0, 100)}...
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400">
                No reviews yet. Create your first review to get started!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
