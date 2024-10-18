import { mutation, query } from "./_generated/server";
import { v } from 'convex/values';

export const createMember = mutation({
    args: {
        role: v.string(), //.enum(["CREATOR", "ADMIN", "MODERATOR", "GUEST"]), // Member role
        profileId: v.string(), // ID of the associated profile
        serverId: v.string(), // ID of the associated server
    },
    handler: async (ctx, { role, profileId, serverId}) => {
      const createdAt = Date.now();
      const updatedAt = createdAt;
      const insertedMemberId = await ctx.db.insert('members', {
        role,
        profileId,
        serverId,
        messages: [],
        createdAt,
        updatedAt
      });
      return { memberId: insertedMemberId };
    },
  });

export const getAllMembers = query({
    args: {},
    handler: async (ctx) => {
       const members = await ctx.db.query('members').collect(); 
       return members;
}, });

export const getMemberByServerIdAndProfileId = query({
  args: {
    serverId: v.string(),
    profileId: v.string(),
  },
  handler: async (ctx, { serverId, profileId }) => {
    const member = await ctx.db.query("members")
      .filter(q => 
        q.eq(q.field("serverId"), serverId) &&
        q.eq(q.field("profileId"), profileId)
      )
      .first();

    return member;
  },
}); 