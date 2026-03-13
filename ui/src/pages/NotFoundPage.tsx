import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 px-4">
      <div className="max-w-md text-center">
        <p className="text-7xl font-extrabold text-primary-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-secondary-900">
          Page not found
        </h1>
        <p className="mt-2 text-secondary-500">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been moved or deleted.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <HomeIcon className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
