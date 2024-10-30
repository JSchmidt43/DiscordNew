import { NextResponse, NextRequest } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function GET(request: Request) {
    const { userId } = auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await fetchQuery(api.profiles.getProfileByUserId, {
        userId
    })

    if (!profile.data) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile.data, { status: 200 });
}



