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
  handler: async (ctx, { role, profileId, serverId }) => {
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


    await addmemberToServerById(ctx, { memberId: insertedMemberId, serverId })

    const member = await getMemberById(ctx, { memberId: insertedMemberId })


    return { data: member.data, message: "Member created successfully" };
  },
});

export const deleteMemberById = mutation({
  args: {
    memberId: v.string()
  }, handler: async (ctx, { memberId }) => {
    const memberIdToDelete = memberId as Id<"members">;

    // Check if the memberIdToDelete exists in the database
    const member = await getMemberById(ctx, { memberId })

    if (!member.data) {
      return { data: null, error: "Member not found to delete!" }
    }

    const server = await getServerById(ctx, { serverId: member.data.serverId });

    if (!server.data) {
      return { data: null, error: "Server not found with the member" }
    }

    if (member.data.profileId === server.data?.creatorId) {
      return { data: null, error: "Cannot remove the creator" }
    }

    await ctx.db.delete(memberIdToDelete);

    await removeMemberFromServerById(ctx, { memberId, serverId: member.data.serverId })

    return { data: memberIdToDelete, message: "Member deleted successfully" }
  },
})

export const updateRoleById = mutation({
  args: {
    memberId: v.string(),
    role: v.string()
  }, handler: async (ctx, { memberId, role }) => {
    const member = await getMemberById(ctx, { memberId: memberId as Id<"members"> });

    if (role !== "ADMIN" && role !== "MODERATOR" && role !== "GUEST") {
      return { data: null, error: "Invalid role" }
    }

    if (!member.data) {
      return { data: null, error: "Member not found to update!" }
    }

    const server = await getServerById(ctx, { serverId: member.data.serverId });

    if (!server.data) {
      return { data: null, error: "Server not found with the member" }
    }

    if (member.data.profileId === server.data?.creatorId) {
      return { data: null, error: "Cannot update the role of the creator" }
    }

    const updateMember = await ctx.db.patch(member.data._id, { role });

    const updatedMember = await getMemberById(ctx, { memberId })

    return { data: updatedMember.data, message: "Member's role updated successfully" }
  },
})

export const getMemberById = query({
  args: {
    memberId: v.string()
  }, handler: async (ctx, { memberId }) => {
    const member = await ctx.db.query("members")
      .filter(q => q.eq(q.field("_id"), memberId))
      .first();

    if (!member) {
      return { data: null, error: "Member not found" }
    }

    return { data: member, message: "Member found" }

  }

})

export const getAllMembers = query({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query('members').collect();
    return { data: members, message: "All members fetched" };
  },
});

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

    if (!member) {
      return { data: null, error: "Member not found!!" };

    }
    return { data: member, message: "Member found" };
  },
});

export const getMemberAndProfileByServerIdAndProfileId = query({
  args: {
    serverId: v.string(),
    profileId: v.string(),
  },
  handler: async (ctx, { serverId, profileId }) => {
    const member = await ctx.db.query("members")
      .filter(q => q.eq(q.field("serverId"), serverId))
      .filter(q => q.eq(q.field("profileId"), profileId))
      .first();

    if (!member) {
      return { data: null, error: "Member not found!!" };
    }
    // Assuming profiles are stored in a collection called "profiles"
    const profile = await ctx.db.query("profiles")
      .filter(q => q.eq(q.field("_id"), member.profileId)) // Assuming member.profileId links to profiles
      .first();

    if (!profile) {
      return { data: null, error: "Profile not found!!" }; // Return member data even if profile is not found
    }

    return { data: { ...member, profile }, message: "Member and profile found" };
  },
});

export const getAllMembersByServerId = query({
  args: {
    serverId: v.string()
  },
  handler: async (ctx, { serverId }) => {
    const members = await ctx.db.query("members")
      .filter(q => q.eq(q.field("serverId"), serverId)).collect()

    return { data: members, message: "Success" };
  },
})

