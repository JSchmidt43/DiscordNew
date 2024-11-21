"use client"
import { Hash, Menu, PhoneCall, UserMinus, Video } from "lucide-react";
import { MobileToggle } from "../mobile-toggle";
import { UserAvatar } from "../user-avatar";
import { Profile } from "@/types";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useModel } from "@/hooks/use-model-store";

interface ChatHeaderProps {
    serverId?: string;
    name: string;
    type: "channel" | "conversation";
    imageUrl?: string;
    friendshipId?: string,
    profile?:Profile
}

export const ChatHeader = ({
    serverId,
    name,
    type,
    imageUrl,
    friendshipId,
    profile
}: ChatHeaderProps) => {
    const router = useRouter()
    const { onOpen } = useModel();

    const datasFromFriendsTable = useQuery(api.friends.getAllDatasFromFriendsTable)?.data;

    useEffect(()=>{
        if(datasFromFriendsTable && profile?._id){
            const hasAcceptedFriend = datasFromFriendsTable.some((friend) => 
            friend.status === "ACCEPTED" && (friend.sender === profile._id || friend.receiver === profile._id))
            if(!hasAcceptedFriend){
                router.push("/directMessages")
            }
            };


    }, [datasFromFriendsTable?.length, profile?._id])


    return (
        <div className="text-md font-semibold px-3 flex items-center justify-between h-12
          border-neutral-200 dark:border-neutral-800 border-b-2"
        >
            {/* Left Section: MobileToggle, Icons, and Name */}
            <div className="flex items-center">
                {serverId ? (
                    <MobileToggle serverId={serverId} profile={profile}/>
                ) : (
                    <MobileToggle profile={profile}/>
                )}
                {type === "channel" && (
                    <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
                )}
                {type === "conversation" && (
                    <UserAvatar src={imageUrl} className="h-8 w-8 md:h-8 md:w-8 mr-2" />
                )}
                <p className="font-semibold text-md text-black dark:text-white">
                    {name}
                </p>
            </div>

            {
                type === "conversation" && (
                    <div className="flex items-center space-x-5 mr-4">
                        <UserMinus className="w-6 h-5 hover:cursor-pointer" onClick={()=> onOpen("deleteFriend", {
                            friend: {
                                friendshipId: friendshipId!,
                                name
                            }
                        })}/>
                    </div>
                )
            }
        </div>
    );
};
