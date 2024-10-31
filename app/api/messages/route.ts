import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
) {
    try {
        const profile = await currentProfile();
        const { content, fileUrl } = await req.json();
        
        // Use URL to get serverId and channelId
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");
        const channelId = searchParams.get("channelId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        
        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 })
        }

        if(!channelId) {
            return new NextResponse("Channel ID missing", { status: 400 })
        }

        if(!content) {
            return new NextResponse("Content missing", { status: 400 })
        }


        const server = await fetchQuery(api.servers.getServerWithMembersAndChannelsByServerIdAndProfileId, {
            serverId : serverId as string,
            profileId: profile._id
        })

        if(!server.data){
            return new NextResponse("Server not found", { status: 404 })
        }

        const channel = await fetchQuery(api.channels.getChannelById, { channelId: channelId as string })
        
        if(!channel.data){
            return new NextResponse("Channel not found", { status: 404 })
        }

        const member = await fetchQuery(api.members.getMemberByServerIdAndProfileId, {
            serverId: serverId as string,
            profileId: profile._id
        })

        if(!member.data){
            return new NextResponse("Channel not found", { status: 404 })
        }

        const message = await fetchMutation(api.messages.createMessage, {
            content,
            memberId: member.data._id,
            username: profile.username,
            channelId: channelId as string,
            fileUrl
        })

        return NextResponse.json(message.data, { status : 201})

    } catch (error) {
        console.log("[CHANNEL_ID_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
