import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile"
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server"

export async function PATCH( 
    req: Request,
    { params } : { params: { serverId: string}}
){
    try {
        const profile = await currentProfile();

        if(!profile){
            return new NextResponse("Unauthorized", { status : 401})
        }
        if(!params.serverId){
            return new NextResponse("Server ID missing", { status : 400})
        }

        // Step 1: Find the member associated with the profileId
        const member = await fetchQuery(api.members.getMemberByServerIdAndProfileId, { 
            serverId: params.serverId,
            profileId: profile._id
         })

        if (!member.data) {
            return new NextResponse("Member not found in this server", { status: 404 });
        }

        const deletedMember = await fetchMutation(api.members.deleteMemberById, {
            memberId: member.data._id
        })

        const server = await fetchQuery(api.servers.getServerById, {
            serverId: member.data.serverId
        })

        return NextResponse.json(server)
        
    } catch (error) {
        console.log("SERVER_LEAVE", error)
        return new NextResponse("Internal Error", { status : 500})
    }
}