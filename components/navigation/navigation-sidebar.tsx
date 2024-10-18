
import { currentProfile } from "@/lib/current-profile"
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "../mode-toggle";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";
import { DirectMessage } from "./direct-message-navbar";
import { UserButton } from "@clerk/nextjs";

export const NavigationSideBar = async () => {
    const profile = await currentProfile();

    if(!profile){
        return redirect("/")
    }

    const servers = await fetchQuery(api.servers.getAllServersByProfileId, {
        profileId: profile._id
    });

    return (
        <div className="flex flex-col items-center
        h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8]">
            <DirectMessage />

            <Separator 
             className="h-[2px] bg-zinc-300 dark:bg-zinc-700
             rounded-md w-10 mx-auto"/>
             <ScrollArea className="flex-1 w-full">
                {servers?.map((server)=> (
                    <div key={server?._id}>
                        <NavigationItem
                        id={server!._id}
                        name={server!.name}
                        imageUrl={server!.imageUrl} />
                    </div>
                ))}
             <NavigationAction />
             </ScrollArea>

             <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                    <ModeToggle/>
                     {/* Client-side Avatar that will handle interaction */}
                    {/* <ClientSideAvatar profile={profile} /> */}
             </div>
        </div>

    )
}