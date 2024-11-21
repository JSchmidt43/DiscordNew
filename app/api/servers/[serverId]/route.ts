import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile";
import { fetchMutation } from "convex/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: {params : {serverId : string}}
) {
    try {
        const profile = await currentProfile();
        const {name, imageUrl } = await req.json();
        if(!profile){
            return new NextResponse("Unauthorized", { status: 401});
        }

        const server = await fetchMutation(api.servers.updateServerById, {
            serverId: params.serverId,
            name,
            imageUrl
        })

        return NextResponse.json(server.data);

    } catch (error) {
        console.log("[SERVER_ID_PATCH_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500})
    }
}

export async function DELETE(
    req: Request,
    { params }: {params : {serverId : string}}
) {
    try {
        const profile = await currentProfile();
        if(!profile){
            return new NextResponse("Unauthorized", { status: 401});
        }

        const server = await fetchMutation(api.servers.deleteServerById, { serverId: params.serverId })
        return NextResponse.json(server.data);

    } catch (error) {
        console.log("[SERVER_ID_DELETE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500})
    }
}