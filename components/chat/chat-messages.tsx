"use client";

import { useState } from "react";
import { ChatItem } from "./chat-item";
import { useRef, ElementRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/convex/utils/formatDate";
import { MemberWithProfiles } from "@/types";
import { ChatWelcome } from "./chat-welcome";
import { Separator } from "../ui/separator";

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
}: ChatMessageProps) => {
    const getMessages = useQuery(api.messages.getAllMessageByChannelId, { channelId });
    const chatRef = useRef<ElementRef<"div">>(null);
    const bottomRef = useRef<ElementRef<"div">>(null);
    const [systemMessages, setSystemMessages] = useState([]);

    // Group messages by date
    const groupMessagesByDate = (messages: any[]) => {
        return messages.reduce((acc, message) => {
            const date = new Date(message.createdAt);
            const dateString = date.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' }); // e.g. "August 2, 2024"
            if (!acc[dateString]) {
                acc[dateString] = [];
            }
            acc[dateString].push(message);
            return acc;
        }, {});
    };

    const groupedMessages = groupMessagesByDate(getMessages?.data || []);

    return (
        <div ref={chatRef} className="flex-1 bg-grey-500 flex flex-col py-4 overflow-y-auto">
            <div className="flex flex-col mt-auto">
                <ChatWelcome name={name} type={type} />
                {/* Render grouped messages */}
                {Object.keys(groupedMessages).map(date => (
                    <div key={date} className="">
                        {/* Styled date separator with margin */}
                        <div className="flex justify-center items-center my-2 mx-4">
                            <hr className="flex-grow border-t border-gray-500" />
                            <span className="mx-4 text-xs text-zinc-600 dark:text-zinc-500 font-semibold">{date}</span>
                            <hr className="flex-grow border-t border-gray-500" />
                        </div>
                        {groupedMessages[date].map((message : any) => (
                            <ChatItem
                                key={message._id}
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
                ))}
            </div>
        </div>
    );
};
