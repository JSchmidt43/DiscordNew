import { currentProfile } from "@/lib/current-profile";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import ReportsList from "@/components/report-list";

interface ReportsPageProps {
  params: {
    serverId: string;
  };
}

const ReportsPage = async ({ params }: ReportsPageProps) => {
  const profile = await currentProfile();

  // Check if the user is authenticated
  if (!profile) {
    return auth().redirectToSignIn();
  }

  // Validate the server ID
  if (!params.serverId) {
    return redirect("/");
  }

  const member = await fetchQuery(api.members.getMemberByServerIdAndProfileId, { 
    serverId: params.serverId,
    profileId: profile._id
  })

  return (
    <div className="p-6 bg-white dark:bg-[#1e1e2c] min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Reports
      </h1>

      <ReportsList serverId={params.serverId} memberId={member.data?._id!}/>
    </div>
  );
};

export default ReportsPage;
