import { mutation, query } from "./_generated/server";
import { v } from 'convex/values';
import { addmemberToServerById, getServerById, removeMemberFromServerById, updateServerById } from "./servers";
import { updateProfileById } from "./profiles";
import { Id } from "./_generated/dataModel";

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


      await addmemberToServerById(ctx, { memberId: insertedMemberId, serverId})

      const server = await getServerById(ctx, { serverId })

      return { memberId: insertedMemberId, server: server };
    },
});

export const deleteMemberById = mutation({
  args: {
    memberId: v.string()
  }, handler: async (ctx, { memberId }) => {
    const memberIdToDelete = memberId as Id<"members">;

    // Check if the memberIdToDelete exists in the database
    const member = await getMemberById(ctx, { memberId})

    if(!member.data){
      return { data: null, message: "Member not found to delete!"}
    }

    const deletedMember = await ctx.db.delete(memberIdToDelete);

    await removeMemberFromServerById(ctx, { memberId, serverId: member.data.serverId })

    return { data: deletedMember, message: "Member deleted successfully"}
  },
})

export const getMemberById = mutation({
  args: {
    memberId: v.string()
  }, handler: async (ctx, { memberId }) => {
    const member = await ctx.db.query("members")
      .filter(q => q.eq(q.field("_id"), memberId))
      .first();

    if(!member){
      return { data: null, message: "Member not found"}
    }

    return { data: member, message: "Member found"}

  }

})

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
      .filter(q => q.eq(q.field("serverId"), serverId))
      .filter(q => q.eq(q.field("profileId"), profileId))
      .first();

    return member;
  },
}); 


export const getAllMembersByServerId = query({
  args: {
    serverId: v.string()
  },
  handler: async(ctx, { serverId }) => {
    const members = await ctx.db.query("members")
      .filter(q => q.eq(q.field("serverId"), serverId)).collect()

    return members || null;
  },
})