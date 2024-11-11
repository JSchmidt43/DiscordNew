import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createMessage = mutation({
    args: {
        content: v.string(), // Message content
        action: v.string(),
        memberId: v.string(),
        profileId: v.string(),
        serverId: v.string(), // ID of the server
    },
    handler: async (ctx, { content, action, serverId, memberId, profileId }) => {
      const createdAt = Date.now();

      const messageData : any= {
        content,
        action,
        serverId,
        profileId,
        memberId,
        createdAt
      };

      const insertedMessageId = await ctx.db.insert('systemMessages',messageData);

      const createdMessage = await getMessageById(ctx, { messageId: insertedMessageId})

      return { data: createdMessage.data, message:"Message created"};
    },
});


export const getMessageById = query({
    args: {
      messageId: v.string()
    },
    handler: async (ctx, { messageId }) => {
       const messages = await ctx.db.query('systemMessages')
        .filter(q => q.eq(q.field("_id"), messageId)).first(); 
  
       return { data: messages, message: "Message found"};
}, });

export const getAllMessageByServerId = query({
  args: {
    serverId: v.string()
  },
  handler: async (ctx, { serverId }) => {
      const messages = await ctx.db.query('systemMessages')
      .filter(q => q.eq(q.field("serverId"), serverId)).collect(); 

      return { data: messages, message: "Message found"};
}, });