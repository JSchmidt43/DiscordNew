import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from 'convex/values';
import { getMemberById } from "./members";
import { getServerByChannelId } from "./servers";
import { getProfileById, getProfileByMemberId } from "./profiles";
import { getFriendshipStatus } from "./friends";

export const createMessage = mutation({
    args: {
      content: v.string(), 
      fileUrl: v.optional(v.string()),
      sender: v.string(),
      receiver: v.string(),
    },
    handler: async (ctx, { content, fileUrl, sender, receiver }) => {
      const createdAt = Date.now();
      const updatedAt = createdAt;

      const checkFriendshipStatus = (await getFriendshipStatus(ctx, { sender, receiver})).data;
      if(!checkFriendshipStatus){
        return { data: null, error: "Cannot send message without being friends."}
      }

      const messageData : any= {
        content,
        sender,
        receiver,
        deleted: false,
        friendshipId: checkFriendshipStatus,
        createdAt,
        updatedAt
      };

      if(fileUrl !== undefined && fileUrl !== null){
        messageData.fileUrl = fileUrl;
      }

      const insertedMessageId = await ctx.db.insert('directMessages',messageData);

      const createdMessage = await getMessageById(ctx, { messageId: insertedMessageId})

      return { data: createdMessage.data, message:"Message created"};
    },
});

export const deleteMessageById = mutation({
  args: {
    messageId: v.string(),
    profileId: v.string()
  }, handler: async (ctx, { messageId, profileId }) => {
    const messageIdToDelete = messageId as Id<"directMessages">;

    const message = await getMessageById(ctx, { messageId })

    if (!message.data) {
      return { data: null, error: "Message not found to delete!" }
    }

    const profile = await getProfileById(ctx, { profileId })

    if (!profile.data) {
      return { data: null, error: "Profile not found" }
    }
    
    const updates : any = {}
    updates.content = `This message has been deleted.`
    updates.deleted = true;

    const messageDeleted = await ctx.db.patch(messageIdToDelete, updates);


    return { data: {
      profile
    }, message: `Message deleted successfully by ${profile?.data.username}` }
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

export const getMessageById = query({
  args: {
    messageId: v.string()
  },
  handler: async (ctx, { messageId }) => {
     const messages = await ctx.db.query('directMessages')
      .filter(q => q.eq(q.field("_id"), messageId)).first(); 

     return { data: messages, message: "Message found"};
}, });

export const getMessageByFriendshipId = query({
  args: {
    friendshipId: v.string()
  },
  handler: async (ctx, { friendshipId }) => {
     const messages = await ctx.db.query('directMessages')
      .filter(q => q.eq(q.field("friendshipId"), friendshipId)).collect(); 

     return { data: messages, message: "Message found"};
}, });

export const getAllMessageBySenderAndReceiver = query({
    args: {
      sender: v.string(),
      receiver: v.string(),
    },
    handler: async (ctx, { sender, receiver }) => {
      // Query the directMessages table with filters for sender and receiver
      const messages = await ctx.db.query('directMessages')
        .filter(q => 
          q.and(
            q.eq(q.field("sender"), sender),
            q.eq(q.field("receiver"), receiver)
          )
        )
        .collect();
  
      // Return the results along with a success message
      return { data: messages, message: "Messages found" };
    },
});
  