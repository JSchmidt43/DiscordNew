import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";

export async function DELETE (
    req: Request,
    { params }: { params: { memberId: string}}
){
    try {
        const profile = await currentProfile();

        if(!profile) {
            return new NextResponse("Unauthorized", { status: 401})
        }

        if(!params.memberId){
            return new NextResponse("Member Id Missing", {status: 400})
        }

        const member = await fetchQuery(api.members.getMemberById, { memberId : params.memberId})

        if(!member){
            return new NextResponse("Member not found", { status: 400})
        }

        const memberProfile = (await fetchQuery(api.profiles.getProfileById, { profileId: member.data?.profileId!}))?.data
        const systemMessage = await fetchMutation(api.systemMessages.createMessage, {
            action: "KICK",
            content: `${memberProfile?.username} has been kicked from the server!`,
            serverId: member.data?.serverId!,
            memberId: member.data?._id!,
            profileId: memberProfile?._id!
        }) 

        const kickedMember = await fetchMutation(api.members.deleteMemberById, { memberId: params.memberId})

        const server = await fetchQuery(api.servers.getServerWithMembersAndChannelsByServerId, { serverId: member.data?.serverId!})



        return NextResponse.json(server)
        

    } catch (error) {
        console.log("[MEMBER_ID_DELETE]", error)
        return new NextResponse("Internal Error", { status: 401})
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: {memberId:string}}
) {
    try {
        
        // const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        const { role } = await req.json();
        
        // if(!profile){
        //     return new NextResponse("Unauthorized", { status: 401 })
        // }

        if(!params.memberId){
            return new NextResponse("Member ID missing", { status: 400 })
        }

        const roleUpdate = await fetchMutation(api.members.updateRoleById, { memberId: params.memberId, role})

        const server = await fetchQuery(api.servers.getServerWithMembersAndChannelsByServerId, { serverId: roleUpdate.data?.serverId!})


        return NextResponse.json(server)

    } catch (error) {
        console.log("[MEMBERS_ID_PATCH]",error);
        return new NextResponse("Internal Error", { status: 500})
    }
}
