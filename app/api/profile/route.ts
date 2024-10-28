import { NextResponse, NextRequest } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function GET(request: Request) {
    const { userId } = auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await fetchQuery(api.profiles.getProfileByUserId, {
        userId
    })

    if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile, { status: 200 });
}


export async function POST(request: Request) {
    const { userId } = auth();
    const { status } = await request.json();
  
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    if (typeof status !== 'string') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
  
    try {
      const updatedProfile = await fetchMutation(api.profiles.updateStatusByUserId, {
        userId,
        status: status
      })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
  }
