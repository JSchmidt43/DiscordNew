import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendFriendRequest = mutation({
    args: {
      senderProfileId: v.string(),
      receiverProfileId: v.string(),
    },
    handler: async (ctx, { senderProfileId, receiverProfileId }) => {
      // Ensure sender and receiver are different profiles
      if (senderProfileId === receiverProfileId) {
        return { data: null, sameError: 'Cannot send a friend request to yourself.' };
      }
  
      // Check if the friend request already exists
      const existingRequest = await ctx.db.query('friends')
        .filter(q => 
          q.or(
            q.and(q.eq(q.field('sender'), senderProfileId), q.eq(q.field('receiver'), receiverProfileId)),
            q.and(q.eq(q.field('sender'), receiverProfileId), q.eq(q.field('receiver'), senderProfileId))
          )
        )
        .first();
  
      if (existingRequest) {
        return { data: null, error: 'Friend request already exists.' };
      }
  
      const createdAt = Date.now();
      const updatedAt = createdAt;
  
      // Insert the new friend request
      const friendRequest = await ctx.db.insert('friends', {
        sender: senderProfileId,
        receiver: receiverProfileId,
        status: 'PENDING',
        createdAt,
        updatedAt,
      });
  
      return { data: friendRequest, message: 'Friend request sent.' };
    },

});

export const acceptFriendRequest = mutation({
    args: {
      requestId: v.string(),
    },
    handler: async (ctx, { requestId }) => {
      // Check for an existing pending request
      const friendRequest = await ctx.db.query('friends')
      .filter(q => q.eq(q.field('_id'), requestId))
      .filter(q => q.eq(q.field('status'), 'PENDING'))
      .first();
  
      if (!friendRequest) {
        return { data: null, error: 'No pending friend request found.' };
      }
  
      // Update status to 'ACCEPTED'
      await ctx.db.patch(friendRequest._id, {
        status: 'ACCEPTED',
        updatedAt: Date.now(),
      });
  
      return { data: friendRequest, message: 'Friend request accepted.' };
    },
});

export const declineFriendRequest = mutation({
    args: {
      requestId: v.string(),
    },
    handler: async (ctx, { requestId }) => {
      // Check for an existing pending request
      const friendRequest = await ctx.db.query('friends')
      .filter(q => q.eq(q.field('_id'), requestId))
      .filter(q => q.eq(q.field('status'), 'PENDING'))
      .first();
  
      if (!friendRequest) {
        return { data: null, error: 'No pending friend request found.' };
      }
  
      // Update status to 'DECLINED'
      await ctx.db.patch(friendRequest._id, {
        status: 'DECLINED',
        updatedAt: Date.now(),
      });
  
      return { data: friendRequest, message: 'Friend request declined.' };
    },
});
  
export const deleteFriend = mutation({
    args: {
      requestId: v.string(), // Use requestId as the parameter
    },
    handler: async (ctx, { requestId }) => {
      const friendRequest = await ctx.db.query('friends')
      .filter(q => q.eq(q.field('_id'), requestId))
      .first();
  
      if (!friendRequest) {
        return { data: null, error: 'No friend relationship found.' };
      }
  
      // Delete the friend request
      await ctx.db.delete(friendRequest._id);
  
      return { data: null, message: 'Friend relationship deleted.' };
    },
});
  
export const getFriendRequestsById = query({
  args: {
    profileId: v.string(), // The profileId whose friend requests we want to fetch
  },
  handler: async (ctx, { profileId }) => {
    // Query to fetch all friend requests where the profileId is either userId1 or userId2
    const friendRequests = await ctx.db.query("friends")
      .filter(q =>
        q.or(
          q.and(q.eq(q.field("receiver"), profileId), q.eq(q.field("status"), "PENDING"))
        )
      )
      .collect(); // Collect results into an array

    return { data: friendRequests, message: "Success"}; // Return the list of friend requests
  },
});