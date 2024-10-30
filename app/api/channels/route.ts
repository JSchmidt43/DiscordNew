import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile"
import { MemberRole } from "@/types";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server"

export async function POST(
    req: Request
){
    try {
        const profile = await currentProfile();
        const { name, type } = await req.json();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");
        
        if(!profile){
            return new NextResponse("Unauthorized", { status : 401});
        }

        if(!serverId){
            return new NextResponse("Server ID missing", { status : 400});
        }

        if(name.toLowerCase() === "general"){
            return new NextResponse("Channel name cannot be 'general'!", { status: 400});
        }

        const serverExists = await fetchQuery(api.servers.getServerById, { serverId })

        if (!serverExists.data) {
            return new NextResponse("Server not found", { status: 404 });
        }

        const createdChannel = await fetchMutation(api.channels.createChannel, { 
            name,
            type,
            creatorId: profile._id,
            serverId
        })

        if(createdChannel.missingInfoError){
            return new NextResponse(createdChannel.missingInfoError, { status: 400})
        }

        if(createdChannel.channelTypeError){
            return new NextResponse(createdChannel.channelTypeError, { status: 400})
        }

        if(createdChannel.existsError){
            return new NextResponse(createdChannel.existsError, { status: 409})
        }

        const server = await fetchQuery(api.servers.getServerById, { serverId: createdChannel.data?.serverId!})

        return NextResponse.json(server);

    } catch (error) {
        console.log("CHANNEL_POST", error);
        return new NextResponse("Internal Error", {status: 500});
    }
}
