import { NavigationSideBar } from "@/components/navigation/navigation-sidebar";
import { api } from "@/convex/_generated/api";
import { InitialProfile } from "@/lib/initial-profile";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

const SetupPage = async () => {
    const profile = await InitialProfile();

    const serverData = await fetchQuery(api.servers.getServerByProfileId, {
        profileId: profile?._id!
    });

    if(serverData.data){
        return redirect(`/servers/${serverData.data?._id}`)
    }

    return (
        <div className="h-full flex flex-col">
          <div className="invisible md:visible md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
            <NavigationSideBar profileId={profile?._id!} />
          </div>
          <main className="md:pl-[72px] h-full flex flex-col items-center justify-center">
            {/* No Server Message */}
            <div className="flex flex-col items-center text-center space-y-6 mt-20">
              <h1 className="text-3xl font-semibold text-zinc-700 dark:text-zinc-200">
                No Server Found
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                It looks like you haven't joined or created a server yet. Please
                create or join a server to get started!
              </p>

    
             
            </div>
          </main>
        </div>
      );
}

export default SetupPage;