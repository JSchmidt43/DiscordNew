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
      if (!serverId || !creatorId || !name || !type) {
        return  { data: null, missingInfoError:"All fields are required: serverId, profileId, name, type"};
      }

      if(type!== "AUDIO" && type!== "TEXT" && type !== "VIDEO"){
        return  { data: null, channelTypeError:"Invalid channel type"};
      }

      const existingChannel = await ctx.db.query('channels')
      .filter(q => q.eq(q.field('serverId'), serverId))
      .filter(q => q.eq(q.field('name'), name))
      .filter(q => q.eq(q.field('type'), type))
      .first(); // Retrieve a single channel

      // If the channel exists, throw an error
      if (existingChannel) {
        return  { data: null, existsError: `A channel with the name "${name}" and type "${type}" already exists in this server.`};
      }

      const createdAt = Date.now();
      const updatedAt = createdAt;
      const insertedChannelId = await ctx.db.insert('channels', {
        name,
        type: type.toUpperCase(),
        creatorId,
        serverId,
        messages: [],
        createdAt,
        updatedAt
      });

      await addChannelToServerById(ctx, { channelId: insertedChannelId, serverId})
      const createdChannel = await getChannelById(ctx, { channelId: insertedChannelId})

      return { data: createdChannel.data, message: "Channel created successfully" };
    },
});

export const deleteChannelById = mutation({
  args: {
    channelId: v.string()
  }, handler: async(ctx, { channelId }) => {
    const channelToDelete = channelId as Id<"channels">
    const channel = await getChannelById(ctx, { channelId })
    if(!channel.data){
      return { data: null, error: "Channel not found"}
    }

    const deletedChannel = await ctx.db.delete(channelToDelete)

    const serverId = channel?.data?.serverId!;

    await removeChannelFromServerById(ctx, { channelId, serverId })
    
    return { data: channelToDelete, message: "Channel Deleted"}
  }
})

export const updateChannelById = mutation({
  args: {
    channelId: v.string(),
    name: v.string(),
    type: v.string(),
  }, handler: async (ctx, { channelId, name, type}) => {

    if(type!== "AUDIO" && type!== "TEXT" && type !== "VIDEO"){
      return  { data: null, channelTypeError:"Invalid channel type"};
    }

    const channelToUpdate = await getChannelById(ctx, {channelId})
    if(!channelToUpdate.data){
      return {data: null, channelExistError: "Channel doesn't exist"}
    }

    if (channelToUpdate.data.name === "general") {
      return { data:null, generalChannelError: "Cannot update the 'general' channel" };
  }

  const updateChannel = await ctx.db.patch(channelToUpdate.data._id, {
    name,
    type,
    updatedAt: Date.now()
  })

  const updatedChannel = await getChannelById(ctx, { channelId: channelToUpdate.data._id})

  return { data: updatedChannel.data, message: "Channel updated successfully"}


  }
})

export const getAllChannels = query({
    args: {},
    handler: async (ctx) => {
       const channels = await ctx.db.query('channels').collect(); 
       return { data: channels, message: "All channels fetched"};
}, });

export const getAllChannelsByServerId = query({
  args: {
    serverId: v.string()
  },
  handler: async (ctx, {serverId}) => {
     const channels = await ctx.db.query('channels')
      .filter(q => q.eq(q.field("serverId"), serverId)).collect();

     return { data: channels, message: "Success"};
}, });

export const getChannelById = query({
  args: {
    channelId: v.string(),
  },
  handler: async (ctx, { channelId }) => {
    const channel = await ctx.db.query('channels')
      .filter(q => q.eq(q.field('_id'), channelId))
      .first(); // Retrieve a single channel
    
    if(!channel){
      return { data: null, error: "Channel not found"}
    }

    return { data: channel, message: "Channel found"}
  },
});

export const isChannelDuplicate = query({
  args: {
      serverId: v.string(),
      name: v.string(),
      type: v.string(),
  },
  handler: async (ctx, { serverId, name, type }) => {
      const existingChannel = await ctx.db.query('channels')
          .filter(q => q.eq(q.field('serverId'), serverId))
          .filter(q => q.eq(q.field('name'), name))
          .filter(q => q.eq(q.field('type'), type))
          .first(); // Retrieves a single matching channel

      if(existingChannel){
        return { data: true, message: "Channel exists"}
      }
      return { data: false, message: "Channel doesn't exist"}

  }
});
