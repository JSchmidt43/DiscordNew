import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile";
import { fetchMutation } from "convex/nextjs";
import { NextResponse } from "next/server";
import { v4 as uuidv4} from "uuid"

export async function PATCH(
    req: Request,
    { params }: {params : {serverId : string}}
) {
    try {
        const profile = await currentProfile();
        if(!profile){
            return new NextResponse("Unauthorized", { status: 401})
        }

        if(!params.serverId){
            return new NextResponse("Server Id Missing", { status: 400})
        }

        const server = await fetchMutation(api.servers.updateServerById, {
            serverId: params.serverId,
            inviteCode: uuidv4()
        })

        return NextResponse.json(server.data)
    } catch (error) {
        console.log("[SERVER_ID]", error);
        return new NextResponse("Internal Error", { status: 500})
    }
}