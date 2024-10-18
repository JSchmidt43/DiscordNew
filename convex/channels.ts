import { mutation, query } from "./_generated/server";
import { v } from 'convex/values';

export const createChannel = mutation({
    args: {
        name: v.string(), // Channel name
        type: v.string(), //.enum(["TEXT", "AUDIO", "VIDEO"]), // Channel type
        creatorId: v.string(), // ID of the associated profile
        serverId: v.string(), // ID of the associated server
    },
    handler: async (ctx, { name, type, creatorId, serverId}) => {
      const createdAt = Date.now();
      const updatedAt = createdAt;
      const insertedChannelId = await ctx.db.insert('channels', {
        name,
        type,
        creatorId,
        serverId,
        messages: [],
        createdAt,
        updatedAt
      });
      return { channelId: insertedChannelId };
    },
  });

export const getAllChannels = query({
    args: {},
    handler: async (ctx) => {
       const channels = await ctx.db.query('channels').collect(); 
       return channels;
}, });

export const getChannelById = query({
  args: {
    channelId: v.string(),
  },
  handler: async (ctx, { channelId }) => {
    const channel = await ctx.db.query('channels')
      .filter(q => q.eq(q.field('_id'), channelId))
      .first(); // Retrieve a single channel
    return channel;
  },
});
    