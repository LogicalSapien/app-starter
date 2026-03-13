import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";

const stats = [
  { name: "Total Users", value: "---", icon: UsersIcon, color: "primary" },
  {
    name: "Documents",
    value: "---",
    icon: DocumentTextIcon,
    color: "success",
  },
  { name: "Analytics", value: "---", icon: ChartBarIcon, color: "warning" },
  { name: "Settings", value: "---", icon: CogIcon, color: "secondary" },
];

const colorMap: Record<string, string> = {
  primary: "bg-primary-100 text-primary-600",
  success: "bg-success-100 text-success-600",
  warning: "bg-warning-100 text-warning-600",
  secondary: "bg-secondary-100 text-secondary-600",
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-1 text-secondary-500">
          Here&apos;s an overview of your application.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorMap[stat.color]}`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-secondary-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder content */}
      <div className="rounded-xl border border-secondary-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-secondary-900">
          Getting Started
        </h2>
        <div className="space-y-4 text-sm text-secondary-600">
          <p>
            This is your application dashboard. Replace this placeholder content
            with your actual application data and widgets.
          </p>
          <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-4">
            <h3 className="mb-2 font-medium text-secondary-700">
              Quick Setup Checklist
            </h3>
            <ul className="list-inside list-disc space-y-1.5 text-secondary-500">
              <li>
                Configure your Supabase project and add environment variables
              </li>
              <li>Set up your API backend and update VITE_API_URL</li>
              <li>Add your application routes and pages</li>
              <li>Customize the sidebar navigation in MainLayout</li>
              <li>Update the color palette in tailwind.config.js</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
