import { mutation, query } from "./_generated/server";
import { v } from 'convex/values';
import { getMemberById } from "./members";

export const createProfile = mutation({
    args: {
      userId: v.string(),
      name: v.string(), // Profile name
      username: v.string(), // Username, must be unique
      password: v.optional(v.string()), // Optional password (consider hashing)
      email: v.string(), // User email
      imageUrl: v.string(), // URL for the profile image
      status: v.string(), // User status
    },
    handler: async (ctx, {  userId, name, username, password, email, imageUrl, status })  => {
      const createdAt = Date.now();
      const updatedAt = createdAt;
      const insertedProfileId = await ctx.db.insert('profiles', {
        userId,
        name,
        username,
        password,
        email,
        imageUrl,
        status,
        createdAt,
        updatedAt
      });
      const createdProfile = await getProfileById(ctx, { profileId: insertedProfileId})

      return { data: createdProfile.data, message: "Profile created successfully" };
    },
});

export const updateProfileById = mutation({
  args: { 
    profileId: v.string(), 
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()), // Optional password (consider hashing)
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Retrieve a profile by userId field
    const profile = await getProfileById(ctx, { profileId: args.profileId });

    if(!profile.data) {
      return { data: null, error: "Profile not found!!" };
    }

    const updates : any = {};

    // Collect the fields that are provided and should be updated
    if (args.name !== undefined) updates.name = args.name;
    if (args.username !== undefined) updates.username = args.username;
    if (args.password !== undefined) updates.password = args.password; // Handle hashing if needed
    if (args.email !== undefined) updates.email = args.email;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.status !== undefined) updates.status = args.status;


    updates.updatedAt = Date.now();
    // Update the profile with the new fields
    await ctx.db.patch(profile.data._id, updates);
    
    const updatedProfile = await getProfileById(ctx, { profileId: profile.data._id });
    return { data: updatedProfile.data, message: "Profile updated successfully" };
  },
});

export const updateProfileByUserId = mutation({
  args: { 
    userId: v.string(), 
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()), // Optional password (consider hashing)
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Retrieve a profile by userId field
    const profile = await getProfileByUserId(ctx, { userId: args.userId });

    if(!profile.data) {
      return { data: null, error: "Profile not found!!" };
    }

    const updates : any = {};

    // Collect the fields that are provided and should be updated
    if (args.name !== undefined) updates.name = args.name;
    if (args.username !== undefined) updates.username = args.username;
    if (args.password !== undefined) updates.password = args.password; // Handle hashing if needed
    if (args.email !== undefined) updates.email = args.email;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.status !== undefined) updates.status = args.status;


    updates.updatedAt = Date.now();
    // Update the profile with the new fields
    await ctx.db.patch(profile.data._id, updates);
    
    const updatedProfile = await getProfileById(ctx, { profileId: profile.data._id });
    return { data: updatedProfile.data, message: "Profile updated successfully" };
  },
});

export const deleteProfileById = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const profile = await getProfileById(ctx, { profileId: id });

    if(!profile.data) {
      return { data: null, error: "Profile not found!!" };
    }
    
    // Delete the profile
    await ctx.db.delete(profile.data._id);

    return { data: profile.data._id ,message: 'Profile deleted successfully' };
  },
});

export const deleteProfileByUserId = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const profile = await getProfileByUserId(ctx, { userId: userId });

    if(!profile.data) {
      return { data: null, error: "Profile not found!!" };
    }
    
    // Delete the profile
    await ctx.db.delete(profile.data._id);

    return { data: profile.data._id ,message: 'Profile deleted successfully' };
  },
});

export const getAllProfiles = query({
    args: {},
    handler: async (ctx) => {
       const profiles = await ctx.db.query('profiles').collect(); 
       return { data: profiles, message: "Fetched All Profiles" };
}, });

export const getProfileById = query({
  args: {
    profileId: v.string(),
  },
  handler: async (ctx, { profileId }) => {
    const profile = await ctx.db.query('profiles')
      .filter(q => q.eq(q.field('_id'), profileId))
      .first(); // Retrieve a single profile
    
    if(!profile){
      return { data: null, error: "Profile not found!!" };
    }

    return { data: profile, message: "Profile found" };

  },
});

export const getProfileByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId })  => {
    const profile = await ctx.db.query('profiles')
      .filter(q => q.eq(q.field('userId'), userId))
      .first(); // Retrieve a single profile
    
      
    if(!profile){
      return { data: null, error: "Profile not found!!" };
    }

    return { data: profile, message: "Profile found" };


  },
});

export const getProfileByMemberId = query({
  args: {
    memberId: v.string(),
  },
  handler: async (ctx, { memberId })  => {

    const member = await getMemberById(ctx, { memberId })
    
    if(!member.data){
      return { data : null, erorr: "Member not found"}
    }

    const profile = await getProfileById(ctx, { profileId: member.data.profileId})
      
    if(!profile){
      return { data: null, error: "Profile not found!!" };
    }

    return { data: profile.data, message: "Profile found" };


  },
});

export const updateStatusByUserId = mutation({
  args: { 
    userId: v.string(), 
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Retrieve a profile by userId field
    const profile = await getProfileByUserId(ctx, { userId: args.userId });

    if(!profile) {
      return { data: null, error: 'Profile not found' };
    }

    const updates : any = {};

    // Collect the fields that are provided and should be updated
    if (args.status !== undefined) updates.status = args.status;

    updates.updatedAt = Date.now();
    // Update the profile with the new fields
    await ctx.db.patch(profile.data?._id!, updates);
    
    const updatedProfile = await getProfileById(ctx, { profileId: profile.data?._id! });
    return { data: updatedProfile, message: "Profile updated"};
  },
});

export const updateStatusById = mutation({
  args: { 
    profileId: v.string(), 
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Retrieve a profile by profileid field
    const profile = await getProfileById(ctx, { profileId: args.profileId });

    if(!profile.data) {
      return { data: null, error: 'Profile not found' };
    }

    const updates : any = {};

    // Collect the fields that are provided and should be updated
    if (args.status !== undefined) updates.status = args.status;

    updates.updatedAt = Date.now();
    // Update the profile with the new fields
    await ctx.db.patch(profile.data?._id!, updates);
    
    const updatedProfile = await getProfileById(ctx, { profileId: profile.data?._id! });
    return { data: updatedProfile.data, message: "Profile status updated"};
  },
});

export const get_profiles_By_Ids = query({
  args: {
    profileIds: v.array(v.string()), // Accepts an array of profile IDs as input
  },
  handler: async (ctx, { profileIds }) => {
    if (profileIds.length === 0){
      return { data: null, error : "Array empty"}
    }

     // Use map to create an array of promises
     const profilePromises = profileIds.map(async (profileId) => {
      const profile = await ctx.db.query('profiles')
        .filter(q => q.eq(q.field('_id'), profileId))
        .first(); // Retrieve a single profile
      return profile; // Return the profile (or null if not found)
    });

    // Wait for all promises to resolve
    const profiles = await Promise.all(profilePromises);

    return { data: profiles, message: "Success"};

  },
});

export const getProfileByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, { username })  => {
    const profile = await ctx.db.query('profiles')
      .filter(q => q.eq(q.field('username'), username))
      .first(); // Retrieve a single profile
      
    if(!profile){
      return { data: null, error: "Profile not found!!" };
    }

    return { data: profile, message: "Profile found" };


  },
});

