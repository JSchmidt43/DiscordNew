import ServerSidebar from "@/components/servers/server-sidebar";
import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

const DirectMsgIdLayout = async ({
    children,
    params,
}: {
    children: React.ReactNode;
    params : { directMessageId: string}
}) => {
    const profile = await currentProfile();

    if(!profile){
        return auth().redirectToSignIn();
    }

    // Check if the server ID exists in the user's servers
    const serverIdExists = await fetchQuery(api.servers.getAllServersByProfileId, {
        profileId: profile._id
    });

    // Redirect if the server ID doesn't exist in profile's servers
    if (!serverIdExists?.data?.some(server => server._id === params.serverId)) {
        return redirect("/");
    }
    
    return (
        <div className="h-full">
            <div className="invisible md:visible fixed md:flex h-full w-60 z-20 flex-col inset-y-0">
                <ServerSidebar profileId={profile._id} serverId={params.serverId} isMobileHeader={false}/>
            </div>
            <main className="h-full md:pl-60 overflow-hidden overflow-wrap break-words">
                {children}
            </main>
        </div>
    );
}

export default DirectMsgIdLayout;


