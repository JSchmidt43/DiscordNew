import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";


export async function POST(req: Request){
    try {
        const { name , imageUrl } = await req.json();
        const profile = await currentProfile();

        if(!profile){
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const server = await fetchMutation(api.servers.createServer, {
            name,
            imageUrl,
            inviteCode: uuidv4(),
            creatorId: profile._id
        });

        return NextResponse.json(server)
        
    } catch (error) {
        console.log("[SERVER_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}



