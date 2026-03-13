import { useState, type FormEvent } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [name, setName] = useState(user?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Implement profile update via API
      await new Promise((resolve) => setTimeout(resolve, 500));
      showAlert('Profile updated successfully.', 'success');
    } catch {
      showAlert('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Profile</h1>
        <p className="mt-1 text-secondary-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="rounded-xl border border-secondary-200 bg-white shadow-sm">
        {/* Avatar section */}
        <div className="flex items-center gap-6 border-b border-secondary-200 p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name ?? 'User avatar'}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-12 w-12 text-primary-500" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              {user?.name ?? 'User'}
            </h2>
            <p className="text-sm text-secondary-500">{user?.email}</p>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="profile-name"
                className="mb-1.5 block text-sm font-medium text-secondary-700"
              >
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-secondary-300 px-3 py-2.5 text-sm text-secondary-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-1.5 block text-sm font-medium text-secondary-700"
              >
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                value={user?.email ?? ''}
                disabled
                className="block w-full rounded-lg border border-secondary-200 bg-secondary-50 px-3 py-2.5 text-sm text-secondary-500"
              />
              <p className="mt-1 text-xs text-secondary-400">
                Email cannot be changed from this page.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end border-t border-secondary-200 pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
