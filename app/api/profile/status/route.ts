import { NextResponse } from 'next/server';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { currentProfile } from '@/lib/current-profile';

export async function PATCH(request: Request) {
    const profile = await currentProfile();
    const { status } = await request.json();
  
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    if (typeof status !== 'string') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
  
    try {
      const updatedProfile = await fetchMutation(api.profiles.updateStatusById, {
        profileId: profile._id,
        status
      })
      return NextResponse.json(updatedProfile.data, { status: 200 });

    } catch (error) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
  }
