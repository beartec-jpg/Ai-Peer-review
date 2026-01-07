// app/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import CodeReviewForm from '@/components/CodeReviewForm';

export default async function HomePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold dark:text-white">
          AI Peer Review
        </h1>
        <a
          href="/dashboard"
          className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          View History
        </a>
      </div>
      <p className="text-center text-lg mb-8 text-gray-600 dark:text-gray-300">
        Submit your code for review by three Grok AI personalities
      </p>

      <CodeReviewForm />
    </div>
  );
}
