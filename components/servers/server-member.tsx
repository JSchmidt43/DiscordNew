"use client";

import { cn } from "@/lib/utils";
import { Crown, ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { UserAvatar } from "../user-avatar";
import { Member, MemberRole, Profile, Server } from "@/types";

interface ServerMemberProps {
    member: Member & { profile: Profile };
    server: Server;
}

// Mapping roles to icons and titles for tooltips
const roleIconMap = {
    [MemberRole.GUEST]: { icon: null, title: "" },
    [MemberRole.MODERATOR]: { icon: <ShieldCheck className="h-4 w-4 text-indigo-500" />, title: "Moderator" },
    [MemberRole.ADMIN]: { icon: <ShieldAlert className="h-4 w-4 text-rose-500" />, title: "Admin" },
    [MemberRole.CREATOR]: { icon: <Crown className="h-4 w-4 text-yellow-500" />, title: "Creator" },
};

export const ServerMember = ({
    member,
    server,
}: ServerMemberProps) => {
    const params = useParams();

    const { icon: Icon, title } = roleIconMap[member.role];

    return (
        <div
            className={cn(
                "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
                params?.memberId === member._id && "bg-zinc-700/20 dark:bg-zinc-700"
            )}
        >
            <UserAvatar
                src={member.profile.imageUrl}
                className="h-8 w-8 md:h-8 md:w-8 hover:cursor-pointer"
            />
            <div className="flex items-center gap-x-1">
                <p
                    className={cn(
                        "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
                        params?.memberId === member._id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
                    )}
                >
                    {member.profile.username}
                </p>
                {/* Display role icon with tooltip */}
                {Icon && <span title={title}>{Icon}</span>}
            </div>
            <div className="ml-auto flex items-center gap-x-1">
                <span
                    className="text-sm truncate overflow-hidden text-ellipsis max-w-[100px] text-gray-500"
                    title={member.profile?.status} // Shows the full status on hover
                >
                    {member.profile?.status}
                </span>
            </div>
        </div>
    );
};
