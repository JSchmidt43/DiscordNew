"use client"
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "../mode-toggle";
import { api } from "@/convex/_generated/api";
import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";
import { DirectMessage } from "./direct-message-navbar";
import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";

export const NavigationSideBar = ({ profileId }: { profileId : string}) => {

    const servers = useQuery(api.servers.getAllServersByProfileId, {
        profileId: profileId
    })?.data;

    return (
        <div className=" flex flex-col items-center
        h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8]">
            <DirectMessage />
            <Separator 
             className="h-[2px] bg-zinc-300 dark:bg-zinc-700
             rounded-md w-10 mx-auto"/>
             <ScrollArea className="flex-1 w-full">
                {servers?.map((server)=> (
                    <div key={server?._id}>
                        <NavigationItem
                        id={server?._id}
                        name={server?.name}
                        imageUrl={server?.imageUrl} />
                    </div>
                ))}
             <NavigationAction />
             </ScrollArea>
             <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                    <ModeToggle/>
                    <UserButton afterSignOutUrl="/"/>
                     {/* Client-side Avatar that will handle interaction */}
                    {/* <ClientSideAvatar profile={profile} /> */}
             </div>
        </div>

    )
}