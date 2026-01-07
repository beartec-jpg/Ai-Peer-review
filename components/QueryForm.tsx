// components/QueryForm.tsx
'use client';

import { useForm } from 'react-hook-form';

interface FormData {
  query: string;
}

interface QueryFormProps {
  onSubmit: (query: string) => void;
}

export default function QueryForm({ onSubmit }: QueryFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { query: '' },
  });

  const onFormSubmit = (data: FormData) => {
    onSubmit(data.query);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-2xl mx-auto mb-8">
      <div className="mb-4">
        <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Coding Query
        </label>
        <textarea
          id="query"
          {...register('query', { required: 'Query is required', minLength: { value: 10, message: 'Query too short (min 10 chars)' } })}
          rows={4}
          placeholder="e.g., 'Implement a REST API endpoint for user authentication in Node.js with JWT'"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        {errors.query && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.query.message}</p>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        disabled={!!errors.query}
      >
        Get Peer-Reviewed Answer
      </button>
    </form>
  );
}
