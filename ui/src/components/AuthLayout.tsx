import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
            <span className="text-xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-secondary-900">
            App Starter
          </h1>
        </div>
        <div className="rounded-2xl border border-secondary-200 bg-white p-8 shadow-lg shadow-secondary-200/50">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
