"use client"
import { useEffect, useRef, ElementRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/convex/utils/formatDate";
import { MemberWithProfiles, Profile } from "@/types";
import { ChatWelcome } from "../chat/chat-welcome";
import { DirectChatItem } from "./direct-message-chatItem";

interface ChatMessageProps {
    name: string,
    friendshipId: string,
    profile: Profile
}

export const DirectChatMessage = ({
    name,
    friendshipId,
    profile
}: ChatMessageProps) => {

    const getMessages = useQuery(api.directMessages.getMessageByFriendshipId, { friendshipId })
    const chatRef = useRef<ElementRef<"div">>(null);
    const bottomRef = useRef<ElementRef<"div">>(null);

    // Scroll to the bottom whenever messages change
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [getMessages?.data]);

    return (
        <div ref={chatRef} className="flex-1 bg-grey-500 flex flex-col py-4 overflow-y-auto">
            <div className="flex flex-col mt-auto">
                <ChatWelcome name={name} type="conversation" />
                    {getMessages?.data.map((message) => (
                         <DirectChatItem
                         key={message._id}
                         id={message._id}
                         content={message.content}
                         timestamp={formatDate(message.createdAt)}
                         fileUrl={message.fileUrl}
                         deleted={message.deleted}
                         isUpdated={message.updatedAt !== message.createdAt}
                         sender={message.sender}
                         receiver={message.receiver}
                         currentUserId={profile._id} // Pass current user ID
                     />
                    ) )}
                {/* Ref div at the bottom of the chat to ensure it always scrolls here */}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
