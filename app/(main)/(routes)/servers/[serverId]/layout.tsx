import ServerSidebar from "@/components/servers/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const ServerIdLayout = async ({
    children,
    params,
}: {
    children: React.ReactNode;
    params : { serverId: string}
}) => {
    const profile = await currentProfile();

    if(!profile){
        return auth().redirectToSignIn();
    }

    // Check if the serverId exists in the profile.servers array
    const serverIdExists = profile.servers.includes(params.serverId);

    // If the serverId doesn't exist in profile.servers, redirect to the homepage
    if (!serverIdExists) {
        return redirect("/");
    }
    
    return (
        <div className="h-full">
                <div
                className="invisible md:visible fixed md:flex h-full w-60 z-20
                flex-col inset-y-0">
                    <ServerSidebar profileId={profile._id} serverId={params.serverId} isMobileHeader={false}/>
                </div>
                <main className="h-full md:pl-60">
                    {children}
                </main>
        </div>
    )
}

export default ServerIdLayout;

