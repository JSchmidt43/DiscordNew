import DirectMessageSidebar from "@/components/directMessages/direct-message-sidebar";
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

    
    return (
        <div className="h-full">
            <div className="invisible md:visible fixed md:flex h-full w-60 z-20 flex-col inset-y-0">
                <DirectMessageSidebar profileId={profile._id}/>
            </div>
            <main className="h-full md:pl-60 overflow-hidden overflow-wrap break-words">
                {children}
            </main>
        </div>
    );
}

export default DirectMsgIdLayout;


