import { internalMutation, mutation, query } from "./_generated/server";
import { v } from 'convex/values';
import { createChannel, deleteChannelById, getAllChannelsByServerId } from "./channels";
import { createMember, deleteMemberById, getAllMembersByServerId, getMemberByServerIdAndProfileId } from "./members";
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
  },
  handler: async (ctx, args) => {
    // Retrieve a profile by userId field
    const server = await getServerById(ctx, { serverId: args.serverId });

    if(!server) {
      return { server: null, message: 'Server not found' };
    }

    const updates : any = {};

    // Collect the fields that are provided and should be updated
    if (args.name !== undefined) updates.name = args.name;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.inviteCode !== undefined) updates.inviteCode = args.inviteCode; 

    updates.updatedAt = Date.now();
    // Update the profile with the new fields
    await ctx.db.patch(server._id, updates);
    
    const updatedServer = await getServerById(ctx, { serverId: server._id });
    return updatedServer;
  },
});

//WORKS
export const addChannelToServerById = mutation({
  args: {
    serverId: v.string(),
    channelId: v.string()
  }, handler: async(ctx, { serverId, channelId}) => {
    const server = await getServerById(ctx, { serverId });

    if (!server) {
      return { server: null, message: 'Server not found' };
    }

    if(server.channels.includes(channelId)){
      return { server, message: 'Channel already exists in server' };
    }

    await ctx.db.patch(server._id, {
      channels: [...server.channels, channelId],
      updatedAt: Date.now()
    })
    const updatedServer = await getServerById(ctx, { serverId: server._id });
    return {
      data: updatedServer, 
      message: "Channel added to server successfully"
    };
    
  }
})

//WORKS
export const addmemberToServerById = mutation({
  args: {
    serverId: v.string(),
    memberId: v.string()
  }, handler: async(ctx, { serverId, memberId}) => {
    const server = await getServerById(ctx, { serverId });

    if (!server) {
      return { server: null, message: 'Server not found' };
    }

    if(server.members.includes(memberId)){
      return { server, message: 'Member already exists in server' };
    }

    await ctx.db.patch(server._id, {
      members: [...server.members, memberId],
      updatedAt: Date.now()
    })
    const updatedServer = await getServerById(ctx, { serverId: server._id });
    return {
      data: updatedServer, 
      message: "Member added to server successfully"
    };
    
  }
})

export const removeChannelFromServerById = mutation({
  args: {
    serverId: v.string(),
    channelId: v.string(),
  },
  handler: async (ctx, { serverId, channelId }) => {
    const server = await getServerById(ctx, { serverId });

    if (!server) {
      return { data: null, message: 'Server not found' };
    }

    if (!server.channels.includes(channelId)) {
      return { data: null, message: 'Channel not found in server' };
    }

    const updatedChannels = server.channels.filter(_id => _id !== channelId);

    await ctx.db.patch(server._id, {
      channels: updatedChannels,
      updatedAt: Date.now(),
    });

    await deleteChannelById(ctx, {channelId})

    const updatedServer = await getServerById(ctx, { serverId: server._id });
    return {
      data: updatedServer,
      message: 'Channel removed from server successfully',
    };
  },
});

export const removeMemberFromServerById = mutation({
  args: {
    serverId: v.string(),
    memberId: v.string(),
  },
  handler: async (ctx, { serverId, memberId }) => {
    const server = await getServerById(ctx, { serverId });

    if (!server) {
      return { data: null, message: 'Server not found' };
    }

    if (!server.members.includes(memberId)) {
      return { data: null, message: 'Member not found in server' };
    }

    const updatedMembers = server.members.filter(id => id !== memberId);

    await ctx.db.patch(server._id, {
      members: updatedMembers,
      updatedAt: Date.now(),
    });

    await deleteMemberById(ctx, { memberId})

    const updatedServer = await getServerById(ctx, { serverId: server._id });
    return {
      data: updatedServer,
      message: 'Member removed from server successfully',
    };
  },
});

//WORKS
export const deleteServerById = mutation({
  args: {
    serverId: v.string()
  }, 
  handler: async(ctx, { serverId }) => {
    const serverIdToDelete = serverId as Id<"servers">;
    const deletedServer = await ctx.db.delete(serverIdToDelete);

    const deletemembers = await getAllMembersByServerId(ctx, { serverId});
    for(let member of deletemembers){
      await deleteMemberById(ctx, { memberId: member._id })
    }

    const deleteChannels = await getAllChannelsByServerId(ctx, { serverId})
    for(let channel of deleteChannels){
      await deleteChannelById(ctx, { channelId: channel._id })
    }

    return { data: deletedServer, message: "Server deleted"}
  },
})

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
    const serverMembers = await getAllMembersByServerId(ctx, { serverId });
    
    // Step 3: Fetch profiles for each member and combine
    const membersWithProfiles = await Promise.all(serverMembers.map(async (member) => {
      const profile = await getProfileById(ctx, { profileId: member.profileId });
      return {
        ...member,
        profile, // Attach the profile object to the member
      };
    }));

    // Step 4: Fetch all channels associated with the server
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
      members: membersWithProfiles,
      channels
    };
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

export const getServerByInviteCodeAndMemberCheck = query({
  args: {
    inviteCode: v.string(),
    profileId: v.string()
  }, handler: async (ctx, {inviteCode, profileId}) => {
    const server = await ctx.db.query("servers")
      .filter(q => q.eq(q.field("inviteCode"), inviteCode))
      .first();

    if(!server){
      return {
        server: null,
        message: "Server not found"
      }
    }

    const members = await getAllMembersByServerId(ctx, { serverId: server._id})
    const profileExists = members.some(member => member.profileId === profileId);

    if(!profileExists){
      return {
        server: server,
        message: "ProfilId not a member"
      }
    }

    return {
      server: {
        ...server,
        members
      },
      message : "201"
    }
  }
})

export const getAllServersByProfileId = query({
  args: {
    profileId: v.string(),
  },
  handler: async (ctx, { profileId }) => {
    // Find all member records that match the provided profileId
    const memberRecords = await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("profileId"), profileId))
      .collect();

    // Get all member IDs associated with this profileId
    const serverIds = memberRecords.map(member => member.serverId);

    let servers = [];
    for (const id   of serverIds) {
      let server = await ctx.db.get(id as Id<"servers">);
      if (server) servers.push(server);
    }

    return servers;

  },
});

