import { internalMutation, mutation, query } from "./_generated/server";
import { v } from 'convex/values';
import { createChannel } from "./channels";
import { createMember, getMemberByServerIdAndProfileId } from "./members";
import { getProfileById, updateProfileById } from "./profiles";
import { Id } from '../convex/_generated/dataModel';

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

export const getAllServers = query({
    args: {},
    handler: async (ctx) => {
       const servers = await ctx.db.query('servers').collect(); 
       return servers;
  }, }
);

export const getServerAndChannelsWithId = query({
  args: {
      serverId: v.string(),
      profileId: v.string(),
  },
  handler: async (ctx, { serverId, profileId }) => {
      // Fetch the server based on serverId
      const server = await ctx.db.query('servers')
          .filter(q => 
              q.eq(q.field('_id'), serverId))
      .first(); // Use first() instead of collect() to get a single server

      if (!server || !server.members || !server.members.includes(profileId)) {
        return { server: null }; // Return null if the server doesn't exist or the profile isn't a member
      }

      // Fetch channels associated with the server
      const channels = await ctx.db.query('channels').filter(q => 
          q.eq(q.field('serverId'), serverId) // Check for channels with matching serverId
      ).collect();

      // Include channels in the server's channels array
      server!.channels = channels.map(channel => channel._id);

      return { server }; // Return the server with its channels
  },
});

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

