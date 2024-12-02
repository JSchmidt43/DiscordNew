import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile"
import { ChannelType } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

interface ChannelIdPageProps {
    params: {
        serverId: string,
        channelId: string
    }
}
const ChannelIdPage = async ({
    params
}: ChannelIdPageProps) => {
    const profile = await currentProfile();
    if (!profile) {
        return auth().redirectToSignIn();
    }

    const server = await fetchQuery(api.servers.getServerById, { serverId: params.serverId });


    if (!server.data) {
        return redirect("/")
    }
    const channel = await fetchQuery(api.channels.getChannelById, { channelId: params.channelId })

    const member = await fetchQuery(api.members.getMemberAndProfileByServerIdAndProfileId, { serverId: params.serverId, profileId: profile._id })

    if (!channel.data || !member.data) {
        return redirect("/");
    }

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                name={channel.data.name}
                serverId={channel.data.serverId}
                type="channel"
                profile={profile}

            />
            {channel.data.type === ChannelType.TEXT && (
                <>
                    <ChatMessages
                        member={member.data}
                        name={channel.data.name}
                        channelId={channel.data._id}
                        type="channel"
                        serverId={params.serverId}
                    />
                    <ChatInput
                        name={channel.data.name}
                        type="channel"
                        username={profile.username}
                        channelId={channel.data._id}
                        serverId={channel.data.serverId}  
                        memberId={member.data._id}
                    />
                </>
            )}
            {channel.data.type === ChannelType.AUDIO && (
                <MediaRoom 
                    chatId={channel.data._id}
                    video={false}
                    audio={true}
                    serverId={channel.data.serverId}
                />
            )}
            {channel.data.type === ChannelType.VIDEO && (
                <MediaRoom 
                    chatId={channel.data._id}
                    video={true}
                    audio={true}
                    serverId={channel.data.serverId}
                />
            )}
        </div>
    )
}

export default ChannelIdPage;