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
        <div className="h-full">
            <div className="invisible md:visible md:flex h-full w-[72px]
            z-30 flex-col fixed inset-y-0">
                <NavigationSideBar profileId={profile?._id!}/>
            </div>
            <main className="md:pl-[72px] h-full">
                <h1>Hello</h1>

            </main>
        </div>
    );
}

export default SetupPage;