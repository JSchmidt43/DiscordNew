import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile"
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
    if(!profile) {
        return auth().redirectToSignIn();
    }

    const server = await fetchQuery(api.servers.getServerById, { serverId: params.serverId});
    

    if(!server.data){
        return redirect("/")
    }
    const channel = await fetchQuery(api.channels.getChannelById, { channelId: params.channelId})

    const member = await fetchQuery(api.members.getMemberAndProfileByServerIdAndProfileId, { serverId: params.serverId, profileId: profile._id})

    if(!channel.data || !member.data){
        return redirect("/");
    }

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader 
                name={channel.data.name}
                serverId={channel.data.serverId}
                type="channel"
            />
            <ChatMessages
                member={member.data}
                name={channel.data.name}
                channelId={channel.data._id}
                type="channel"
            />
            <ChatInput
                name={channel.data.name}
                type="channel"
                username={profile.username}
                channelId={channel.data._id}
                serverId={channel.data.serverId}  
                memberId={member.data._id}
            />
        </div>
    )
}

export default ChannelIdPage;