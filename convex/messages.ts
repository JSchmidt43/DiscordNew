import { mutation, query } from "./_generated/server";
import { v } from 'convex/values';

export const createMessage = mutation({
    args: {
      content: v.string(), 
      fileUrl: v.optional(v.string()),
      memberId: v.optional(v.string()),
      username: v.string(),
      channelId: v.string(), 
    },
    handler: async (ctx, { content, fileUrl, memberId, username, channelId }) => {
      const createdAt = Date.now();
      const updatedAt = createdAt;
      const insertedMessageId = await ctx.db.insert('messages', {
        content,
        fileUrl,
        memberId,
        username,
        channelId,
        deleted: false,
        createdAt,
        updatedAt
      });
      return { messageId: insertedMessageId };
    },
  });

export const getAllMessages = query({
    args: {},
    handler: async (ctx) => {
       const messages = await ctx.db.query('messages').collect(); 
       return messages;
    }, });
