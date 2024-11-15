import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from 'convex/values';
import { getMemberById } from "./members";
import { getServerByChannelId } from "./servers";
import { getProfileById, getProfileByMemberId } from "./profiles";
import { getFriendshipStatus } from "./friends";

export const createReport = mutation({
    args: {
        reporterId: v.string(),
        reportedMemberId: v.string(),
        reason: v.string(),
        description: v.string(),
        status: v.string(),
        reportedMemberRole: v.string(),
        serverId: v.string()
    },
    handler: async (ctx, { reporterId, reportedMemberId, reportedMemberRole, reason, description, status, serverId }) => {
        const createdAt = Date.now();
        const updatedAt = createdAt;


        const reportData: any = {
            reporterId,
            reportedMemberId,
            reportedMemberRole,
            reason,
            description,
            status,
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
        reason: v.string(),
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
        if (args.reason !== undefined) updates.reason = args.reason;
        if (args.description !== undefined) updates.description = args.description;

        updates.updatedAt = Date.now();
        // Update the profile with the new fields
        await ctx.db.patch(report.data!._id, updates);

        const updatedReport = await getReportById(ctx, { reportId: report.data!._id });
        return { data: updatedReport.data, message: "Message updated successfully" };
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
        reporterId: v.string()
    },
    handler: async (ctx, { reporterId }) => {
        const reports = await ctx.db.query('reports')
            .filter(q => q.eq(q.field("reporterId"), reporterId)).collect();

        return { data: reports, message: "Reports found" };
    },
});

export const getReportsByStautsAndServerId = query({
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