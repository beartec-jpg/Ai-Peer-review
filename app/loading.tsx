// app/loading.tsx
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Peer-reviewing your query with AI models... This may take 30-60 seconds.
      </p>
    </div>
  );
}
