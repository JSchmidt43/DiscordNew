"use client"

import { MemberRole, ServerWithChannelsWithMembers, ServerWithMembersWithProfiles } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ChevronDown, LogOut, PlusCircle, Settings, Trash, UserPlus, Users } from "lucide-react";
import { useModel } from "@/hooks/use-model-store";

interface ServerHeaderProps {
    server: ServerWithChannelsWithMembers;
    role?: MemberRole | string;
    isMobile?: boolean
};

export const ServerHeader = ({
    server,
    role,
    isMobile
}: ServerHeaderProps) => {
    const { onOpen } = useModel();

    const isModerator = role === MemberRole.MODERATOR || role === MemberRole.ADMIN || role === MemberRole.CREATOR;
    const isAdmin = role === MemberRole.ADMIN || role === MemberRole.CREATOR;
    const isCreator = role === MemberRole.CREATOR;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="focus:outline-none"
                asChild>
                <button className="w-full text-md font-semibold px-3 flex
                 items-center h-12 border-neutral-200
                 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10
                 dark:hover:bg-zinc-700/50 transition"
                >
                    {server?.name}
                    {isMobile ? (
                        <ChevronDown className="h-5 w-5 ml-2" />
                    ) : (<ChevronDown className="h-5 w-5 ml-auto" />)}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 text-xs
             font-medium text-black dark:text-neutral-400 space-y-[2px]"
            >
                {isModerator && (
                    <DropdownMenuItem
                        onClick={() => onOpen("invite", { server })}
                        className="text-indigo-600 dark:text-indigo-400
                     px-3 py-2 text-sm cursor-pointer"
                    >
                        Invite People
                        <UserPlus className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}

                {isAdmin && (
                    <DropdownMenuItem
                        className="px-3 py-2 text-sm cursor-pointer"
                        onClick={() => onOpen("editServer", { server })}
                    >
                        Server Settings
                        <Settings className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}

                {isModerator && (
                    <DropdownMenuItem onClick={() => {
                        onOpen("members", { server })
                    }}
                        className="px-3 py-2 text-sm cursor-pointer"
                    >
                        Manage Members
                        <Users className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuItem onClick={() => onOpen("createChannel")}
                        className="px-3 py-2 text-sm cursor-pointer"
                    >
                        Create Channel
                        <PlusCircle className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {
                    isModerator && (
                        <DropdownMenuSeparator />
                    )
                }

                {isCreator && (
                    <DropdownMenuItem
                        onClick={() => onOpen("deleteServer", { server })}
                        className="text-rose-500 px-3 py-2 text-sm cursor-pointer"
                    >
                        Delete Server
                        <Trash className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {!isCreator && (
                    <DropdownMenuItem
                        onClick={() => onOpen("leaveServer", { server })}
                        className="text-rose-500 px-3 py-2 text-sm cursor-pointer"
                    >
                        Leave Server
                        <LogOut className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}

            </DropdownMenuContent>
        </DropdownMenu>
    )
}
