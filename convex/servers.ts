import { internalMutation, mutation, query } from "./_generated/server";
import { v } from 'convex/values';
import { createChannel } from "./channels";
import { createMember, getMemberByServerIdAndProfileId } from "./members";
import { getProfileById, updateProfileById } from "./profiles";
import { Id } from '../convex/_generated/dataModel';

//WORKS
export const createServer = mutation({
    args: {
        name: v.string(), // Server name
        imageUrl: v.string(), // URL for the server image
        inviteCode: v.string(), // Unique invite code for the server
        creatorId: v.string(), // ID of the creator profile
    },
    handler: async (ctx, { name, imageUrl, inviteCode, creatorId}) => {
      const createdAt = Date.now();
      const updatedAt = createdAt;
      const insertedServerId = await ctx.db.insert('servers', {
        name,
        imageUrl,
        inviteCode,
        creatorId,
        members: [],
        channels: [],
        createdAt,
        updatedAt
      });

      const generalChannel = await createChannel(ctx, {
        name: "general",
        type: "TEXT",
        creatorId: creatorId,
        serverId: insertedServerId
      })

      const creator = await createMember(ctx, {
        role: "CREATOR",
        profileId: creatorId,
        serverId: insertedServerId
      });

      // Fetch the newly created server
      const server = await ctx.db.get(insertedServerId);

      const profile = await getProfileById(ctx, { profileId: creatorId });
      const creatorServers = profile?.servers || [];

      // Add the new server ID to the creator's profile
      await updateProfileById(ctx, {
        profileId: creatorId,
        servers: [...creatorServers, insertedServerId] // Append the new server ID to the existing list
    });


      // Update server’s `channels` property by adding the new channelId
      server?.channels.push(generalChannel.channelId);

      // Update server’s `members` property by adding the new memberId
      server?.members.push(creator.memberId);

      // Update the server to include the new channels array
      await ctx.db.patch(insertedServerId, { channels: server?.channels });

      await ctx.db.patch(insertedServerId, { members: server?.members });

      return { serverId: insertedServerId };
    },
});

//WORKS
export const updateServerById = mutation({
  args: { 
    serverId: v.string(), 
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    inviteCode: v.optional(v.string()),

    members: v.optional(v.array(v.string())),
    channels: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Retrieve a profile by userId field
    const server = await getServerWithMembersAndChannelsByServerId(ctx, { serverId: args.serverId });

    if(!server) {
      return { error: 'Server not found' };
    }

    const updates : any = {};

    // Collect the fields that are provided and should be updated
    if (args.name !== undefined) updates.name = args.name;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.inviteCode !== undefined) updates.inviteCode = args.inviteCode; 
    if (args.members !== undefined) updates.members = args.members; 
    if (args.channels !== undefined) updates.channels = args.channels; 

    updates.updatedAt = Date.now();
    // Update the profile with the new fields
    await ctx.db.patch(server._id, updates);
    
    const updatedServer = await getServerById(ctx, { serverId: server._id });
    return updatedServer;
  },
});

//WORKS
export const getServerWithMembersAndChannelsByServerIdAndProfileId = query({
  args: {
    serverId: v.string(),
    profileId: v.string(),
  },
  handler: async (ctx, { serverId, profileId }) => {
    // Step 1: Fetch the server by serverId
    const server = await ctx.db.query('servers')
      .filter(q => q.eq(q.field('_id'), serverId))
      .first();

    // Return null if the server doesn't exist or the profile is not a member
    if (!server) {
      return null;
    }

    // Step 2: Fetch all members associated with the server
    const memberPromises = server.members.map(memberId =>
      ctx.db.query('members')
        .filter(q => q.eq(q.field('_id'), memberId))
        .first()
    );

    const members = (await Promise.all(memberPromises))
      .filter(member => member !== null) // Remove any null values
      .sort((a, b) => (a.role > b.role ? 1 : -1)); // Sort members by role

    
    // Step 3: Check if the provided profileId exists among members' profileIds
    const isProfileMember = members.some(member => member.profileId === profileId);
    if (!isProfileMember) {
      return { server: null };
    }

    // Step 4: Fetch all channels associated with the server
    const channelPromises = server.channels.map(channelId =>
      ctx.db.query('channels')
        .filter(q => q.eq(q.field('_id'), channelId))
        .first()
    );
    const channels = (await Promise.all(channelPromises))
      .filter(channel => channel !== null) // Remove any null values
      .sort((a, b) => a.createdAt - b.createdAt); // Sort channels by createdAt

    // Step 5: Return the server details with members and channels
    return {
      ...server,
      members,
      channels,
    };
  },
});

//WORKS
export const getServerWithMembersAndChannelsByServerId = query({
  args: {
    serverId: v.string(),
  },
  handler: async (ctx, { serverId }) => {
    // Step 1: Fetch the server by serverId
    const server = await ctx.db.query('servers')
      .filter(q => q.eq(q.field('_id'), serverId))
      .first();

    if (!server) {
      return null; // Return empty arrays if the server doesn't exist
    }

    // Step 2: Fetch all members associated with the server
    const memberPromises = server.members.map(memberId =>
      ctx.db.query('members')
        .filter(q => q.eq(q.field('_id'), memberId))
        .first()
    );
    const members = (await Promise.all(memberPromises))
      .filter(member => member !== null) // Filter out any null values if a member wasn't found
      .sort((a, b) => (a.role > b.role ? 1 : -1)); // Order members by role (asc)


     // Step 3: Fetch all channels associated with the server
     const channelPromises = server.channels.map(channelId =>
      ctx.db.query('channels')
        .filter(q => q.eq(q.field('_id'), channelId))
        .first()
    );
    const channels = (await Promise.all(channelPromises))
    .filter(channel => channel !== null) // Filter out any null values if a channel wasn't found
    .sort((a, b) => a.createdAt - b.createdAt); // Order channels by createdAt (asc)


    // Step 4: Return the members and channels
    return {
      ...server,
      members,
      channels
    };
  },
});

//WORKS
export const getAllServersByProfileId = query({
  args: {
      profileId: v.string(),
  },
  handler: async (ctx, { profileId }) => {
      // Step 1: Fetch the profile by profileId to get the list of server IDs
      const profile = await getProfileById(ctx, { profileId });

      if (!profile || !profile.servers || profile.servers.length === 0) {
          return []; // Return an empty array if the profile doesn't exist or has no servers
      }

    
      // Step 2: Fetch all servers using the IDs stored in the profile's 'servers' array
      const serverPromises = profile.servers.map(serverId => ctx.db.get(serverId as Id<"servers">));
      
      // Step 3: Wait for all server fetch operations to complete
      const servers = await Promise.all(serverPromises);

      return servers; // Return the list of servers
  },
});

//WORKS
export const getAllServers = query({
    args: {},
    handler: async (ctx) => {
       const servers = await ctx.db.query('servers').collect(); 
       return servers;
  }, }
);

//WORKS
export const getServerByProfileId = query({
  args: {
      profileId: v.string(),
  },
  handler: async (ctx, { profileId }) => {
    // Get all servers
    const servers = await ctx.db.query('servers').collect();

    let matchedServer = null;

    // Iterate over each server
    for (const server of servers) {
      // Check members array in the current server
      for (const memberId of server.members) {
        // Fetch member by memberId
        const member = await ctx.db.query('members')
          .filter(q => q.eq(q.field('_id'), memberId))
          .first();

        // If member has matching profileId, return the server
        if (member && member.profileId === profileId) {
          matchedServer = server;
          break;
        }
      }

      // If server found, break out of loop
      if (matchedServer) break;
    }

    // Return the matched server (or null if none found)
    return { server: matchedServer };
  },
});

//WORKS
export const getServerById = query({
  args: {
    serverId: v.string(), // Accepts the server ID as input
  },
  handler: async (ctx, { serverId }) => {
    // Query the servers table to find the server matching the given serverId
    const server = await ctx.db
      .query("servers") // Assuming 'servers' is the table name
      .filter(q => q.eq(q.field("_id"), serverId)) // Filter by server ID
      .first(); // Retrieve a single server

    if (!server) {
      return null
    }

    return server; // Return the server object
  },
});