import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getProfileById } from "./profiles";
import { deleteAllMessagesByFriendshipId } from "./directMessages";

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

    await deleteFriendRequestById(ctx, { requestId})

    return { data: friendRequest, message: 'Friend request declined.' };
  },
});

export const deleteFriendRequestById = mutation({
  args: {
    requestId: v.string(), // The unique ID of the friend request to delete
  },
  handler: async (ctx, { requestId }) => {
    // Query the database to find the friend request by ID
    const friendRequest = await ctx.db.query('friends')
      .filter(q => q.eq(q.field('_id'), requestId))
      .first();

    // If no friend request found, return an error
    if (!friendRequest) {
      return { data: null, error: "Friend request not found." };
    }

    // Delete the friend request
    await ctx.db.delete(friendRequest._id);

    return { data: null, message: "Friend request deleted successfully." };
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

    await deleteAllMessagesByFriendshipId(ctx, { friendshipId: friendRequest._id})

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

    return { data: friendRequests, message: "Success" }; // Return the list of friend requests
  },
});

export const getFriendsById = query({
  args: {
    profileId: v.string(), // The profileId whose friends we want to fetch
  },
  handler: async (ctx, { profileId }) => {
    // Query to fetch all friends where profileId is either sender or receiver with status "ACCEPTED"
    const friends = await ctx.db.query("friends")
      .filter(q =>
        q.and(
          q.eq(q.field("status"), "ACCEPTED"),
          q.or(
            q.eq(q.field("sender"), profileId),
            q.eq(q.field("receiver"), profileId)
          )
        )
      )
      .collect(); // Collect results into an array

    // Process each friendship record to get the friend's profile
    const friendsWithProfiles = await Promise.all(
      friends.map(async (friendship) => {
        // Determine which ID is the friend's ID (the one that is NOT the profileId)
        const friendId = friendship.sender === profileId ? friendship.receiver : friendship.sender;

        // Fetch the friend's profile
        const friendProfile = (await getProfileById(ctx, { profileId: friendId }))?.data;


        // Return the friendship data along with the friend's profile
        return friendProfile ? { ...friendship, friendProfile } : null;

      })
    );

    const filteredFriendsWithProfiles = friendsWithProfiles.filter((item) => item !== null);

    return { data: filteredFriendsWithProfiles, message: "Success" }; // Return the list of friends
  },
});

export const getFriendshipStatus = query({
  args: {
    sender: v.string(),
    receiver: v.string(),
  },
  handler: async (ctx, { sender, receiver }) => {
    // Query to find the friendship record between sender and receiver
    const friendship = await ctx.db.query('friends')
      .filter(q =>
        q.or(
          q.and(
            q.eq(q.field('sender'), sender),
            q.eq(q.field('receiver'), receiver)
          ),
          q.and(
            q.eq(q.field('sender'), receiver),
            q.eq(q.field('receiver'), sender)
          )
        )
      )
      .first(); // We only need the first match since friendships are unique

    if (!friendship) {
      // No friendship found, return null or indicate that no friendship exists
      return { data: null, error: "Friendship not found." };  // "NONE" if there is no friendship record
    }

    if(friendship.status === "ACCEPTED"){
      return { data: friendship._id, message: "Users are friends." };  // The status of the friendship (ACCEPTED, DECLINED, PENDING)
      
    }
    return { data: null, error: "Users are not friends" };  

    // Return the status of the friendship (ACCEPTED, DECLINED, PENDING)
  },
});

// A new function to fetch the profiles of both sender and receiver only if the friendship is 'ACCEPTED'
export const getReceiverFriendProfile = query({
  args: {
    friendshipId: v.string(), // Friendship ID
    profileId: v.string(), // The profile ID to check if it's one of the sender or receiver
  },
  handler: async (ctx, { friendshipId, profileId }) => {
    // Query to find the friendship record using the provided friendshipId
    const friendship = await ctx.db.query('friends')
      .filter(q => q.eq(q.field('_id'), friendshipId))
      .first(); // Fetch the friendship record by ID

    // If no friendship found or status is not 'ACCEPTED', return an error
    if (!friendship || friendship.status !== 'ACCEPTED') {
      return { data: null, error: "The users are not friends or the friendship is not accepted." };
    }

    // Check if the profileId is either the sender or receiver
    let otherUserId;
    if (friendship.sender === profileId) {
      otherUserId = friendship.receiver; // If profileId is sender, get receiver
    } else if (friendship.receiver === profileId) {
      otherUserId = friendship.sender; // If profileId is receiver, get sender
    } else {
      return { data: null, error: "The provided profileId is not part of this friendship." };
    }

    // Fetch the profile of the other user
    const otherUserProfile = await getProfileById(ctx, { profileId: otherUserId });
    if (!otherUserProfile.data) {
      return { data: null, error: "Other user's profile not found." };
    }

    // Return the other user's profile if the friendship is valid and 'ACCEPTED'
    return { 
      data: otherUserProfile.data, 
      message: "Other user's profile fetched successfully." 
    };
  },
});

// Function to check if the given profileId is either the sender or receiver of an accepted friend request
export const getFirstAcceptedFriendByProfileId = query({
  args: {
    profileId: v.string(),
  },
  handler: async (ctx, { profileId }) => {

    // Fetch the first accepted friend where the user is either the sender or receiver
    const friend = await ctx.db.query('friends')
      .filter(f => 
        // Ensure that profileId is either sender or receiver, and the status is ACCEPTED
        f.and(
          f.or(
            f.eq(f.field('sender'), profileId), // Match if profileId is sender
            f.eq(f.field('receiver'), profileId), // Or if profileId is receiver
          ),
          f.eq(f.field('status'), 'ACCEPTED'), // Status must be "ACCEPTED"
        )
      )
      .first(); // Fetch the first match

    // If no accepted friend is found, return null
    if (!friend) {
      return { data: null, message: "No accepted friends found" };
    }

    // Determine the opposite friend (sender or receiver)
    const friendId = friend.sender === profileId ? friend.receiver : friend.sender;

    // Return the friend ID (the opposite of the profileId)
    return { data: friend._id, message: "Accepted friend retrieved successfully" };
  },
});

export const getAllDatasFromFriendsTable= query({
  args: {}, // No arguments needed
  handler: async (ctx) => {
    // Query the entire `friends` table and collect all records
    const allItems = await ctx.db.query("friends").collect(); 

    // Return the collected items
    return { data: allItems, message: "All items fetched successfully." };
  },
});


