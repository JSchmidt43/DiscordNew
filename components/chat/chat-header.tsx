import { Hash, Menu, PhoneCall, Video } from "lucide-react";
import { MobileToggle } from "../mobile-toggle";
import { UserAvatar } from "../user-avatar";

interface ChatHeaderProps {
    serverId?: string;
    name: string;
    type: "channel" | "conversation";
    imageUrl?: string;
}

export const ChatHeader = ({
    serverId,
    name,
    type,
    imageUrl
}: ChatHeaderProps) => {
    return (
        <div className="text-md font-semibold px-3 flex items-center justify-between h-12
          border-neutral-200 dark:border-neutral-800 border-b-2"
        >
            {/* Left Section: MobileToggle, Icons, and Name */}
            <div className="flex items-center">
                {serverId ? (
                    <MobileToggle serverId={serverId} />
                ) : (
                    <MobileToggle />
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
                        <PhoneCall className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300" />
                        <Video className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300" />
                    </div>
                )
            }
        </div>
    );
};
