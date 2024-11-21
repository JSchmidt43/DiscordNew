"use client"
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { formatDate, isThisWeek, isToday } from "@/convex/utils/formatDate";
import { useModel } from "@/hooks/use-model-store";

interface ReportsListProps {
    serverId: string;
    memberId: string; // Current user's ID to check ownership
}

const ReportsList: React.FC<ReportsListProps> = ({ serverId, memberId }) => {
    const { onOpen } = useModel();

    const [activeTab, setActiveTab] = useState<"unsolved" | "solved" | "myReports">("unsolved");

    const reports = useQuery(
        activeTab === "myReports"
            ? api.reports.getReportsByMemberId
            : api.reports.getReportsByStautsAndServerId,
        {
            serverId: activeTab !== "myReports" ? serverId : "",
            status: activeTab === "unsolved" ? "unsolved" : activeTab === "solved" ? "solved" : "",
            reporterId: activeTab === "myReports" ? memberId : undefined,
        }
    )?.data;

    const membersWithProfiles = useQuery(api.servers.getServerWithMembersAndChannelsByServerId, { serverId })?.data?.members || [];
    
    const currentMember = membersWithProfiles?.find((member) => member._id === memberId);

    // Sort and Group Reports
    const sortedReports = [...(reports || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const groupedReports = sortedReports.reduce((groups: any, report: any) => {
        const createdDate = new Date(report.createdAt);
        const groupKey = isToday(createdDate)
            ? "Today"
            : isThisWeek(createdDate)
            ? "This Week"
            : "Older";

        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(report);

        return groups;
    }, {});

    return (
        <div>
            {/* Tab Links and Create Button */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("unsolved")}
                        className={`px-4 py-2 rounded-md transition-all ${
                            activeTab === "unsolved"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                    >
                        Unsolved Reports
                    </button>
                    <button
                        onClick={() => setActiveTab("solved")}
                        className={`px-4 py-2 rounded-md transition-all ${
                            activeTab === "solved"
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                    >
                        Solved Reports
                    </button>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("myReports")}
                        className={`px-4 py-2 rounded-md transition-all ${
                            activeTab === "myReports"
                                ? "bg-yellow-600 text-white"
                                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                    >
                        My Reports
                    </button>
                    <button
                        onClick={() =>
                            onOpen("createReport", {
                                createReport: {
                                    serverId: serverId,
                                    reporterId: memberId,
                                    membersWithProfiles: membersWithProfiles?.filter((member) => member._id !== memberId),
                                },
                            })
                        }
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                    >
                        Create Report
                    </button>
                </div>
            </div>

            {/* Reports List */}
            <div
                className="bg-gray-50 dark:bg-[#292a3e] shadow-md rounded-lg p-4"
                style={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto" }}
            >
                {Object.keys(groupedReports).length > 0 ? (
                    Object.keys(groupedReports).map((groupKey) => (
                        <div key={groupKey}>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2 mt-2">
                                {groupKey}
                            </h3>
                            <div className="space-y-4">
                                {groupedReports[groupKey].map((report: any) => (
                                    <div
                                        key={report.reportId}
                                        onClick={() =>
                                            onOpen("report", {
                                                reportData: {
                                                    report,
                                                    members: membersWithProfiles,
                                                    currentUser: currentMember,
                                                },
                                            })
                                        }
                                        className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg flex flex-col relative hover:cursor-pointer"
                                    >
                                        {/* Tags Section */}
                                        <div
                                            className={`flex flex-wrap gap-2 ${
                                                report.tags && report.tags.length > 0 ? "" : "hidden"
                                            }`}
                                        >
                                            {report.tags?.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs font-semibold px-4 py-1 bg-blue-500 text-white rounded-full border border-blue-700 mb-2"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Content Section */}
                                        <div className="cursor-pointer flex-1">
                                            <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">
                                                {report.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {report.description}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                Reported by: {report.reporterUsername}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Created: {formatDate(report.createdAt)}
                                            </p>
                                        </div>

                                        {/* Status and Delete Section */}
                                        <div className="absolute top-4 right-4 flex items-center gap-4">
                                            {/* Status Badge */}
                                            <span
                                                className={`text-xs font-semibold px-2 py-1 rounded-md ${
                                                    report.status === "unsolved"
                                                        ? "bg-red-500 text-white"
                                                        : report.status === "pending"
                                                        ? "bg-yellow-500 text-white"
                                                        : "bg-green-500 text-white"
                                                }`}
                                            >
                                                {report.status === "unsolved"
                                                    ? "Unsolved"
                                                    : report.status === "pending"
                                                    ? "Pending"
                                                    : "Solved"}
                                            </span>

                                            {/* Delete Button */}
                                            {(memberId === report.reporterId || currentMember?.role === "CREATOR")  && (
                                                <button
                                                    onClick={(e) =>
                                                    {
                                                        e.stopPropagation(); // Prevent the click event from propagating to the parent div        
                                                        onOpen("deleteReport", {
                                                            deleteReport: {
                                                                reportId: report._id,
                                                                title: report.title,
                                                            },
                                                        })
                                                    }
                                                    }
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                        No {activeTab} reports found.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ReportsList;
