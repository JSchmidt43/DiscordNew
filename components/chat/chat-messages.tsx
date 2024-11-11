"use client"
import { useEffect, useRef, ElementRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/convex/utils/formatDate";
import { MemberWithProfiles } from "@/types";
import { ChatItem } from "./chat-item";
import { ChatWelcome } from "./chat-welcome";

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
    // Query to get regular messages from the channel
    const getMessages = useQuery(api.messages.getAllMessageByChannelId, { channelId });
    const regularMessages = getMessages?.data || [];

    // Query to get the channel metadata, including creation time
    const channelMetadata = useQuery(api.channels.getChannelById, { channelId });
    const channelCreationTime = channelMetadata?.data?.createdAt ? new Date(channelMetadata.data.createdAt) : null;

    // Query to get system messages for the server
    const systemMessages = useQuery(api.systemMessages.getAllMessageByServerId, { serverId: serverId! })?.data || [];

    // Filter system messages based on the channel's creation time
    const filteredSystemMessages = channelCreationTime
        ? systemMessages.filter(message => new Date(message.createdAt) > channelCreationTime)
        : [];

    // Combine regular and filtered system messages
    const allMessages = [
        ...regularMessages,
        ...filteredSystemMessages
    ];

    // Sort all messages by createdAt to ensure they are in chronological order
    const sortedMessages = allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Group messages by date
    const groupMessagesByDate = (messages: any[]) => {
        return messages.reduce((acc, message) => {
            const date = new Date(message.createdAt);
            const dateString = date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            });
            if (!acc[dateString]) {
                acc[dateString] = [];
            }
            acc[dateString].push(message);
            return acc;
        }, {} as { [key: string]: any[] });
    };

    const groupedMessages = groupMessagesByDate(sortedMessages);

    const chatRef = useRef<ElementRef<"div">>(null);
    const bottomRef = useRef<ElementRef<"div">>(null);

    // Scroll to the bottom whenever messages change
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [getMessages?.data, filteredSystemMessages]);

    return (
        <div ref={chatRef} className="flex-1 bg-grey-500 flex flex-col py-4 overflow-y-auto">
            <div className="flex flex-col mt-auto">
                <ChatWelcome name={name} type={type} />
                {/* Render grouped messages */}
                {Object.keys(groupedMessages).map(date => (
                    <div key={date}>
                        {/* Styled date separator */}
                        <div className="flex justify-center items-center my-2 mx-4">
                            <hr className="flex-grow border-t border-gray-500" />
                            <span className="mx-4 text-xs text-zinc-600 dark:text-zinc-500 font-semibold">{date}</span>
                            <hr className="flex-grow border-t border-gray-500" />
                        </div>
                        {groupedMessages[date].map((message: any) => (
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
                                action={message.action}
                            />
                        ))}
                    </div>
                ))}
                {/* Ref div at the bottom of the chat to ensure it always scrolls here */}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
