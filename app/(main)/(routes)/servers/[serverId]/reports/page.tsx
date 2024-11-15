import { currentProfile } from "@/lib/current-profile";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import Link from "next/link";

interface ReportsPageProps {
  params: {
    serverId: string;
  };
  searchParams: {
    tab?: "solved" | "unsolved";
  };
}

const ReportsPage = async ({ params, searchParams }: ReportsPageProps) => {
  const profile = await currentProfile();

  // Check if the user is authenticated
  if (!profile) {
    return auth().redirectToSignIn();
  }

  // Determine which tab is active based on searchParams
  const activeTab = searchParams.tab || "unsolved";

  // Fetch reports based on the active tab
  const reports = await fetchQuery(api.reports.getReportsByStautsAndServerId, {
    serverId: params.serverId,
    status: activeTab,
  });

  // Redirect if there are no reports or the server is invalid
  if (!reports?.data) {
    return redirect("/");
  }

  return (
    <div className="p-6 bg-white dark:bg-[#1e1e2c] min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Reports Management
      </h1>

      {/* Tab Links */}
      <div className="flex gap-4 mb-6">
        <Link
          href={`/${params.serverId}/reports?tab=unsolved`}
          className={`px-4 py-2 rounded-md transition-all ${
            activeTab === "unsolved"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          Unsolved Reports
        </Link>
        <Link
          href={`/${params.serverId}/reports?tab=solved`}
          className={`px-4 py-2 rounded-md transition-all ${
            activeTab === "solved"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          Solved Reports
        </Link>
      </div>

      {/* Reports List */}
      <div className="bg-gray-50 dark:bg-[#292a3e] shadow-md rounded-lg p-4">
        {reports.data.length > 0 ? (
          <div className="space-y-4">
            {reports.data.map((report: any) => (
              <div
                key={report.reportId}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">
                    {report.reason}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {report.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Reported by: {report.reporterId}
                  </p>
                </div>
                <div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      activeTab === "unsolved"
                        ? "bg-yellow-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {activeTab === "unsolved" ? "Pending" : "Resolved"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No {activeTab} reports found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
