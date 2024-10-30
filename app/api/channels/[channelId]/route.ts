import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";


export async function PATCH(
    req: Request,
    { params }: { params: { channelId: string } }
) {
    try {
        const profile = await currentProfile();
        const { name, type } = await req.json();
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 })
        }

        if (!params.channelId) {
            return new NextResponse("Channel ID missing", { status: 400 })
        }

        if (name.toLowerCase() === "general") {
            return new NextResponse("Name cannot be 'general'", { status: 400 })
        }

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Check if a channel with the same name and type already exists in the server
        const existingChannel = await fetchQuery(api.channels.isChannelDuplicate, {
            serverId,
            name,
            type
        })

        if (existingChannel.data) {
            return new NextResponse(`Name '${name}' already exists in ${type} channel.`, { status: 400 });
        }

        const updateChannel = await fetchMutation(api.channels.updateChannelById, { channelId : params.channelId, name, type})

        if(updateChannel.generalChannelError){
            return new NextResponse(updateChannel.generalChannelError, { status: 403});
        }

        const channels = await fetchQuery(api.channels.getAllChannelsByServerId, { serverId})

        return NextResponse.json(channels)

    } catch (error) {
        console.log("[CHANNEL_ID_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}



export async function DELETE(
    req: Request,
    { params }: { params: { channelId: string } }
) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 })
        }

        if (!params.channelId) {
            return new NextResponse("Channel ID missing", { status: 400 })
        }

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const channelDelete = await fetchMutation(api.channels.deleteChannelById, { channelId: params.channelId })

        if(channelDelete.error){
            return new NextResponse(channelDelete.error, { status: 500 })
        }

        const channels = await fetchQuery(api.channels.getAllChannelsByServerId, { serverId })

        return NextResponse.json(channels)

    } catch (error) {
        console.log("[CHANNEL_ID_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
