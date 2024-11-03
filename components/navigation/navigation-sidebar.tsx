"use client"
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "../mode-toggle";
import { api } from "@/convex/_generated/api";
import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";
import { DirectMessage } from "./direct-message-navbar";
import { useQuery } from "convex/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Modal } from "../modal";
import ProfileDialogContent from "../profile-dialog-content";

export const NavigationSideBar = ({ profileId }: { profileId: string }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false); // State to handle hover

    const openDialog = () => setIsDialogOpen(true);
    const closeDialog = () => setIsDialogOpen(false);
  

    const servers = useQuery(api.servers.getAllServersByProfileId, {
        profileId: profileId
    })?.data;

    const profile = useQuery(api.profiles.getProfileById, { profileId })?.data
    return (
        <div className=" flex flex-col items-center
        h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8]">
            <DirectMessage />
            <Separator
                className="h-[2px] bg-zinc-300 dark:bg-zinc-700
             rounded-md w-10 mx-auto"/>
            <ScrollArea className="flex-1 w-full">
                {servers?.map((server) => (
                    <div key={server?._id}>
                        <NavigationItem
                            id={server?._id}
                            name={server?.name}
                            imageUrl={server?.imageUrl} />
                    </div>
                ))}
                <NavigationAction profile={profile!}/>
            </ScrollArea>
            <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                <ModeToggle />
                <div
                    className="relative inline-block"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Avatar */}
                    <Avatar onClick={openDialog} className="cursor-pointer">
                        <AvatarImage src={profile?.imageUrl || ""} />
                        <AvatarFallback>{profile?.name || "User"}</AvatarFallback>
                    </Avatar>

                    {/* Tooltip - Show username on hover */}
                    {isHovered && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-12 bg-gray-600 text-white text-sm rounded-md px-2 py-1 whitespace-nowrap">
                            {profile?.username.trim() || "User"} {/* Ensure no extra spaces */}
                        </div>
                    )}
                </div>

                {/* Modal dialog for profile */}
                <Modal isOpen={isDialogOpen} onClose={closeDialog}>
                    <ProfileDialogContent profile={profile} />
                </Modal>
            </div>
        </div>

    )
}