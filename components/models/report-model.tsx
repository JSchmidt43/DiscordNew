"use client";

import { useModel } from "@/hooks/use-model-store";
import { useRouter } from "next/navigation";
import React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { ShieldAlert, ShieldCheck, Crown } from "lucide-react";
import { formatDate } from "@/convex/utils/formatDate";
import { Member } from "@/types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const roleHierarchy = {
    GUEST: 0,
    MODERATOR: 1,
    ADMIN: 2,
    CREATOR: 3,
};

const roleIconMap = {
    MODERATOR: <ShieldCheck className="w-5 h-5 text-indigo-500" />,
    ADMIN: <ShieldAlert className="w-5 h-5 text-red-500" />,
    CREATOR: <Crown className="w-5 h-5 text-yellow-500" />,
    GUEST: null,
};

const ReportModel = () => {
    const { isOpen, onClose, type, data } = useModel();
    const router = useRouter();

    const isModelOpen = isOpen && type === "report";
    const { reportData } = data || {};

    const handleClose = () => {
        onClose();
    };

    const solveReport = useMutation(api.reports.solveReport);

    const onSubmit = async () => {
        try {

            await solveReport({
                reportId: reportData?.report._id,
                status: "solved"
            })

            handleClose();
            router.refresh();
        } catch (error: any) {
            console.error(error);
        }
    };

    if (!reportData) return null;

    const offender = reportData?.members?.find(
        (member: any) => member._id === reportData.report.reportedMemberId
    );

    const victim = reportData?.members?.find(
        (member: any) => member._id === reportData.report.reporterId
    );

    const canSolve =
    reportData.currentUser && // Ensure currentUser exists
    (reportData.currentUser.role === "CREATOR" || // Always show the button if user is CREATOR
        roleHierarchy[reportData.currentUser.role] > (roleHierarchy[reportData.report.reportedMemberRole] ?? -1) || // Higher role than offender
        reportData.report.reporterId === reportData.currentUser._id) && // Owner of the report
    reportData.report.status !== "solved"; // Only show if the report is not already solved


    return (
        <Dialog open={isModelOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 max-w-xl w-full rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold mb-4">Report Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Report Title */}
                    <div className="border-b border-gray-300 dark:border-gray-700 pb-4">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{reportData.report.title}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Reported by: <span className="font-medium">{reportData.report.reporterUsername}</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Created: {formatDate(reportData.report.createdAt)}
                        </p>
                    </div>

                    {/* Report Description */}
                    <div>
                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Description
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{reportData.report.description}</p>
                    </div>

                    {/* Tags Section */}
                    {reportData.report.tags?.length > 0 && (
                        <div>
                            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {reportData.report.tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="text-xs font-semibold px-3 py-1 bg-blue-500 text-white rounded-full"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status Section */}
                    <div>
                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Status
                        </h3>
                        <span
                            className={`text-sm font-semibold px-3 py-1 rounded-md ${reportData.report.status === "unsolved"
                                    ? "bg-red-500 text-white"
                                    : reportData.report.status === "pending"
                                        ? "bg-yellow-500 text-white"
                                        : "bg-green-500 text-white"
                                }`}
                        >
                            {reportData.report.status === "unsolved"
                                ? "Unsolved"
                                : reportData.report.status === "pending"
                                    ? "Pending"
                                    : "Solved"}
                        </span>
                    </div>

                    {/* Offender Role */}
                    {offender && (
                        <div>
                            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                Offender
                            </h3>
                            <div className="flex items-center gap-2">
                                {roleIconMap[reportData.report.reportedMemberRole] || <span></span>}
                                <span className="text-gray-800 dark:text-gray-200">
                                    {offender.profile?.username || "Unknown"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6 flex justify-end space-x-4">
                    {/* Close Button */}
                    <Button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        Close
                    </Button>

                    {/* Mark as Solved Button */}
                    {canSolve  && (
                        <Button
                            onClick={onSubmit}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                        >
                            Mark as Solved
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReportModel;
