// app/api/servers/check/route.ts
import { api } from '@/convex/_generated/api';
import { currentProfile } from '@/lib/current-profile';
import { fetchQuery } from 'convex/nextjs';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const inviteCode = searchParams.get('inviteCode');

  const user = await currentProfile();

  if(!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if invite code is provided
  if (!inviteCode) {
    return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
  }

  try {
    // Query the database to check if a server exists with the given invite code
    const server = await fetchQuery(api.servers.getServerByInviteCode, { inviteCode})

    if (server.data) {
      return NextResponse.json({ exists: true, id: server.data._id, currentUserId: user._id });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking server:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
