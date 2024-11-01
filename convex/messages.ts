import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from 'convex/values';
import { getMemberById } from "./members";
import { getServerByChannelId } from "./servers";
import { getProfileByMemberId } from "./profiles";

export const createMessage = mutation({
    args: {
      content: v.string(), 
      fileUrl: v.optional(v.string()),
      memberId: v.string(),
      username: v.string(),
      channelId: v.string(), 
    },
    handler: async (ctx, { content, fileUrl, memberId, username, channelId }) => {
      const createdAt = Date.now();
      const updatedAt = createdAt;

      const messageData : any= {
        content,
        memberId,
        username,
        channelId,
        deleted: false,
        createdAt,
        updatedAt
      };

      if(fileUrl !== undefined && fileUrl !== null){
        messageData.fileUrl = fileUrl;
      }

      const insertedMessageId = await ctx.db.insert('messages',messageData);

      const createdMessage = await getMessageById(ctx, { messageId: insertedMessageId})

      return { data: createdMessage.data, message:"Message created"};
    },
});

export const deleteMessageById = mutation({
  args: {
    messageId: v.string(),
    memberId: v.string()
  }, handler: async (ctx, { messageId, memberId }) => {
    const messageIdToDelete = messageId as Id<"messages">;

    const message = await getMessageById(ctx, { messageId })

    if (!message.data) {
      return { data: null, error: "Message not found to delete!" }
    }

    const member = await getMemberById(ctx, { memberId })

    if (!member.data) {
      return { data: null, error: "Message not found" }
    }

    const server = await getServerByChannelId(ctx, { channelId: message.data.channelId })
    
    if(!server){
      return { data: null, error: "Server not found"}
    }

    if(member.data.serverId !== server.data?._id){
      return { data: null, error: "Unauthorized"}
    }
    const profile = (await getProfileByMemberId(ctx, {memberId: member.data._id})).data
    
    const updates : any = {}
    updates.content = `This message has been deleted. (By ${profile?.username})`
    updates.deleted = true;

    const messageDeleted = await ctx.db.patch(messageIdToDelete, updates);


    return { data: {
      ...member.data,
      profile
    }, message: `Message deleted successfully by ${profile?.username}` }
  },
})

export const deleteServerMessageById = mutation({
  args: {
    messageId: v.string(),
  }, handler: async (ctx, { messageId }) => {
    const messageIdToDelete = messageId as Id<"messages">;

    const message = await getMessageById(ctx, { messageId })

    if (!message.data) {
      return { data: null, error: "Message not found to delete!" }
    }

    const server = await getServerByChannelId(ctx, { channelId: message.data.channelId })
    
    if(!server.data){
      return { data: null, error: "Server not found"}
    }

    const messageDeleted = await ctx.db.delete(messageIdToDelete);


    return { data:messageDeleted, message: `Server Message deleted` }
  },
})

export const updateMessageById = mutation({
  args: { 
    messageId: v.string(), 
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Retrieve the message by Id
    const message = await getMessageById(ctx, { messageId: args.messageId });

    if(!message.data) {
      return { data: null, error: 'Message not found' };
    }

    const updates : any = {};

    // Collect the fields that are provided and should be updated
    if (args.content !== undefined) updates.content = args.content;

    updates.updatedAt = Date.now();
    // Update the profile with the new fields
    await ctx.db.patch(message.data!._id, updates);
    
    const updatedMessage = await getMessageById(ctx, { messageId: message.data!._id });
    return { data: updatedMessage.data, message: "Message updated successfully" };
  },
});

export const getAllMessages = query({
    args: {},
    handler: async (ctx) => {
       const messages = await ctx.db.query('messages').collect(); 
       return messages;
}, });

export const getMessageById = query({
  args: {
    messageId: v.string()
  },
  handler: async (ctx, { messageId }) => {
     const messages = await ctx.db.query('messages')
      .filter(q => q.eq(q.field("_id"), messageId)).first(); 

     return { data: messages, message: "Message found"};
}, });

export const getAllMessageByChannelId = query({
  args: {
    channelId: v.string()
  },
  handler: async (ctx, { channelId }) => {
     const messages = await ctx.db.query('messages')
      .filter(q => q.eq(q.field("channelId"), channelId)).collect(); 

     return { data: messages, message: "Message found"};
}, });