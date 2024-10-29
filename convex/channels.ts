import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from 'convex/values';
import { addChannelToServerById, removeChannelFromServerById } from "./servers";

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

      await addChannelToServerById(ctx, { channelId: insertedChannelId, serverId})


      return { channelId: insertedChannelId };
    },
});

export const deleteChannelById = mutation({
  args: {
    channelId: v.string()
  }, handler: async(ctx, { channelId }) => {
    const channelToDelete = channelId as Id<"channels">
    const deletedChannel = await ctx.db.delete(channelToDelete)

    const channel = await getChannelById(ctx, { channelId })
    const serverId = channel?.serverId!;

    await removeChannelFromServerById(ctx, { channelId, serverId })
    
    return { data: deletedChannel, message: "Channel Deleted"}
  }
})

export const getAllChannels = query({
    args: {},
    handler: async (ctx) => {
       const channels = await ctx.db.query('channels').collect(); 
       return channels;
}, });

export const getAllChannelsByServerId = query({
  args: {
    serverId: v.string()
  },
  handler: async (ctx, {serverId}) => {
     const channels = await ctx.db.query('channels')
      .filter(q => q.eq(q.field("serverId"), serverId)).collect();
    

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
