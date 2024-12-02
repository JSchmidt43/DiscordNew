import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from 'convex/values';
import { getProfileByMemberId } from "./profiles";
import { getMemberById } from "./members";


export const createReport = mutation({
    args: {
        reporterId: v.string(),
        reportedMemberId: v.string(),
        title: v.string(),
        description: v.string(),
        tags: v.array(v.string()),
        serverId: v.string()
    },
    handler: async (ctx, { reporterId, tags, reportedMemberId, title, description, serverId }) => {
        const createdAt = Date.now();
        const updatedAt = createdAt;

        const profile = (await getProfileByMemberId(ctx, { memberId: reporterId }))?.data;

        const reportedMember = (await getMemberById(ctx, { memberId: reportedMemberId }))?.data
        console.log(reportedMember)

        const reportData: any = {
            reporterId,
            reporterUsername : profile?.username,
            reportedMemberId,
            tags,
            reportedMemberRole : reportedMember?.role,
            title,
            description,
            status : "unsolved",
            serverId,

            createdAt,
            updatedAt
        };


        const insertedReportId = await ctx.db.insert('reports', reportData);

        const createdMessage = await getReportById(ctx, { reportId: insertedReportId })

        return { data: createdMessage.data, message: "Report created" };
    },
});

export const deleteReportById = mutation({
    args: { reportId: v.string() },
    handler: async (ctx, { reportId }) => {

        const reportToDelete = reportId as Id<"reports">
        // Delete the report
        await ctx.db.delete(reportToDelete);

        return { data: reportId, message: 'Report deleted successfully' };
    },
})

export const updateReportById = mutation({
    args: {
        reportId: v.string(),
        status: v.string(),
        title: v.string(),
        description: v.string()
    },
    handler: async (ctx, args) => {
        // Retrieve the report by Id
        const report = await getReportById(ctx, { reportId: args.reportId });

        if (!report.data) {
            return { data: null, error: 'Report not found' };
        }

        const updates: any = {};

        // Collect the fields that are provided and should be updated
        if (args.status !== undefined) updates.status = args.status;
        if (args.title !== undefined) updates.title = args.title;
        if (args.description !== undefined) updates.description = args.description;

        updates.updatedAt = Date.now();
        // Update the profile with the new fields
        await ctx.db.patch(report.data!._id, updates);

        const updatedReport = await getReportById(ctx, { reportId: report.data!._id });
        return { data: updatedReport.data, message: "Report updated successfully" };
    },
});

export const solveReport = mutation({
    args: {
        reportId: v.string(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        // Retrieve the report by Id
        const report = await getReportById(ctx, { reportId: args.reportId });

        if (!report.data) {
            return { data: null, error: 'Report not found' };
        }

        const updates: any = {};

        // Collect the fields that are provided and should be updated
        if (args.status !== undefined) updates.status = args.status;

        updates.updatedAt = Date.now();
        // Update the profile with the new fields
        await ctx.db.patch(report.data!._id, updates);

        const updatedReport = await getReportById(ctx, { reportId: report.data!._id });
        return { data: updatedReport.data, message: "Report solved successfully" };
    },
});

export const getReportById = query({
    args: {
        reportId: v.string()
    },
    handler: async (ctx, { reportId }) => {
        const report = await ctx.db.query('reports')
            .filter(q => q.eq(q.field("_id"), reportId)).first();

        return { data: report, message: "Report found" };
    },
});

export const getReportsByMemberId = query({
    args: {
        reporterId: v.string(),
        serverId: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, { reporterId }) => {
        const reports = await ctx.db.query('reports')
            .filter(q => q.eq(q.field("reporterId"), reporterId)).collect();

        return { data: reports, message: "Reports found" };
    },
});

export const getReportsByStatusAndServerId = query({
    args: {
        status: v.string(),
        serverId: v.string()
    },
    handler: async (ctx, { status, serverId }) => {
        const reports = await ctx.db.query('reports')
            .filter(q => q.eq(q.field("serverId"), serverId) )
            .filter(q => q.eq(q.field("status"), status))
        .collect();

        return { data: reports, message: "Reports found" };
    },
});                 

