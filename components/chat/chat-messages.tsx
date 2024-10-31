"use client";

import { Loader2, ServerCrash } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { ChatItem } from "./chat-item";
import { useRef, ElementRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/convex/utils/formatDate";
import { Member, MemberWithProfiles } from "@/types";
import { ChatWelcome } from "./chat-welcome";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface ChatMessageProps {
    name: string,
    member: MemberWithProfiles,
    channelId: string,
    serverId?: string,
    type: "channel" | "conversation"
}

export const ChatMessages = ({
    name, 
    member,
    channelId,
    type,
    serverId
} : ChatMessageProps) => {
    const getMessages = useQuery(api.messages.getAllMessageByChannelId, { channelId }); // Prepare the mutation

    const chatRef = useRef<ElementRef<"div">>(null);
    const bottomRef = useRef<ElementRef<"div">>(null);
    const [systemMessages, setSystemMessages] = useState([]);


    return (
        <div ref={chatRef} className="flex-1 bg-grey-500 flex flex-col py-4 overflow-y-auto">

            <div className="flex flex-col mt-auto">
                <ChatWelcome name={name} type={type} />
                {/* Render all messages */}
                {getMessages?.data?.map(message => (
                    <ChatItem 
                        key={message._id} // Added key prop for React
                        id={message._id}
                        content={message.content}
                        username={message.username}
                        timestamp={formatDate(message.createdAt)}
                        fileUrl={message.fileUrl}
                        deleted={message.deleted}
                        deletionActor={message.memberId}
                        currentMember={member}
                        isUpdated={message.updatedAt !== message.createdAt}
                    />
                ))}
            </div>


        </div>
    );
};
