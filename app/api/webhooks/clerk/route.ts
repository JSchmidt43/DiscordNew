import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import { WebhookEvent } from '@clerk/nextjs/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function POST(req: any) {

    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
    if (!WEBHOOK_SECRET) {
        throw new Error('Please add STREAM_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Get the headers
    const headerPayload = headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400,
        })
    }

    console.log(svix_id)
    console.log(svix_timestamp)
    console.log(svix_signature)

    const payload = await req.json();
    const body: any = JSON.stringify(payload);

    console.log('Received webhook payload:', payload); // Log the payload for debugging


    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occured', {
            status: 400,
        })
    }

    const eventType = evt.type;
    const user = payload.data; // Assuming `data` contains the user information
    console.log('User data for update:', user);

    try {
        switch (eventType) {
            case "user.created":
                // Handle user creation
                await handleUserCreated(user);
                return NextResponse.json({ message: 'User Created successfully.[WEBHOOK]' }, { status: 201});
            case "user.updated":
                // Handle user update
                await handleUserUpdated(user);
                return NextResponse.json({ message: 'User Updated successfully.[WEBHOOK]' }, { status: 200});

            case "user.deleted":
                // Handle user deletion
                await handleUserDeleted(user);
                return NextResponse.json({ message: 'User Deleted successfully.[WEBHOOK]' }, { status: 200});

            default:
                console.warn(`Unhandled event type: ${eventType}`);
                break;
        }

        return NextResponse.json({ message: `Unhandled event type: ${eventType}.` }, { status: 404 });
    } catch (error) {
        console.error('Error handling webhook:', error);
        return new Response('Error handling webhook.', { status: 500 });
    }
}

// Function to handle user creation
async function handleUserCreated(user: any) {
    await fetchMutation(api.profiles.createProfile, {
        userId: user.id,
        username: user.username || user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email_addresses[0]?.email_address,
        imageUrl: user.image_url,
        password: user.password || undefined, // Set to undefined initially; handle later if required
        status: '🟢 Online',
    });
}

// Function to handle user update
async function handleUserUpdated(user: any) {
    // Check if user.id is available
    if (!user.id) {
        throw new Error('User ID is missing in the update event.');
    }

    const existingProfile = await fetchQuery(api.profiles.getProfileByUserId, {
        userId: user.id,
    });

    if (!existingProfile) {
        throw new Error('User profile not found for update.');
    }

    // Hash the password if it is enabled
    let hashedPassword = null;
    if (user.password_enabled && user.password) {
        const saltRounds = 10; // You can adjust the salt rounds
        hashedPassword = await bcrypt.hash(user.password, saltRounds); // Replace with actual password if available
    }

    await fetchMutation(api.profiles.updateProfileByUserId, {
        userId: existingProfile.data?.userId!,
        username: user.username || existingProfile.data?.username,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email_addresses[0]?.email_address,
        imageUrl: user.image_url,
        password: hashedPassword || undefined, // Set to undefined initially; handle later if required
    });
}

// Function to handle user deletion
async function handleUserDeleted(user: any) {
    const existingProfile = await fetchQuery(api.profiles.getProfileByUserId, {
        userId: user.id,
    });

    if (!existingProfile) {
        throw new Error('User profile not found for deletion.');
    }

    await fetchMutation(api.profiles.deleteProfileByUserId, {
        userId: user.id,
    });

}
