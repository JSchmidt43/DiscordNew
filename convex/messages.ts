import { mutation, query } from "./_generated/server";
import { v } from 'convex/values';

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