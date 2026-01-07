// app/auth/verify-request/page.tsx
export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div>
          <svg
            className="mx-auto h-12 w-12 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            A magic link has been sent to your email address.
          </p>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Click the link in the email to sign in. You can close this window.
          </p>
        </div>
        <div className="mt-6">
          <a
            href="/auth/signin"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Didn't receive the email? Try again
          </a>
        </div>
      </div>
    </div>
  );
}
