"use client";

import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { formatDate } from "@/convex/utils/formatDate";
import { useModel } from "@/hooks/use-model-store";

interface ReportsListProps {
    serverId: string;
    memberId: string; // Current user's ID to check ownership
}

const ReportsList: React.FC<ReportsListProps> = ({ serverId, memberId }) => {
    const { onOpen } = useModel();

    const [activeTab, setActiveTab] = useState<"unsolved" | "solved" | "myReports">("unsolved");
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showMyReportsModal, setShowMyReportsModal] = useState<boolean>(false); // State for showing 'My Reports' modal
    const [myReports, setMyReports] = useState<any[]>([]); // State for storing filtered reports

    // Conditional query based on activeTab
    const reports = useQuery(
        activeTab === "myReports"
            ? api.reports.getReportsByMemberId // Use a query that only takes `reporterId`
            : api.reports.getReportsByStautsAndServerId, // Use query for "unsolved" and "solved" with `serverId` and `status`
        {
            serverId: activeTab !== "myReports" ? serverId : undefined, // Only pass `serverId` when not "myReports"
            status: activeTab === "unsolved" ? "unsolved" : activeTab === "solved" ? "solved" : undefined,
            reporterId: activeTab === "myReports" ? memberId : undefined, // Only pass `userId` if the activeTab is "myReports"
        })?.data;


    // Handle "My Reports" button click
    const handleMyReports = () => {
        setShowMyReportsModal(true); // Show the modal for "My Reports"
    };

    const membersWithProfiles = useQuery(api.servers.getServerWithMembersAndChannelsByServerId, { serverId })?.data?.members

    const members = membersWithProfiles?.filter(member => member._id !== memberId)

    const deleteReport = useMutation(api.reports.deleteReportById);

    const handleCreateReport = (title: string, description: string) => {
        // Replace with your actual report creation logic
        console.log(`Creating report with Title: ${title} and Description: ${description}`);
    };

    return (
        <div>
            {/* Tab Links and Create Button */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("unsolved")}
                        className={`px-4 py-2 rounded-md transition-all ${activeTab === "unsolved"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                    >
                        Unsolved Reports
                    </button>
                    <button
                        onClick={() => setActiveTab("solved")}
                        className={`px-4 py-2 rounded-md transition-all ${activeTab === "solved"
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                    >
                        Solved Reports
                    </button>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("myReports")} // Handle "My Reports" click
                        className={`px-4 py-2 rounded-md transition-all ${activeTab === "myReports"
                            ? "bg-yellow-600 text-white"
                            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                    >
                        My Reports
                    </button>
                    <button
                        onClick={() => {
                            onOpen("createReport", {
                                createReport: {
                                    serverId: serverId,
                                    reporterId: memberId,
                                    membersWithProfiles: members
                                }
                            })
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                    >
                        Create Report
                    </button>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-gray-50 dark:bg-[#292a3e] shadow-md rounded-lg p-4">
                {reports?.length > 0 ? (
                    <div className="space-y-4">
                        {reports?.map((report: any) => (
                            <div
                                key={report.reportId}
                                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg flex flex-col relative"
                            >
                                {/* Tags Section */}
                                <div className={`flex flex-wrap gap-2 ${report.tags && report.tags.length > 0 ? '' : 'hidden'}`}>
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
                                <div
                                    className="cursor-pointer flex-1 "
                                    onClick={() => setSelectedReport(report)}
                                >
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
                                        className={`text-xs font-semibold px-2 py-1 rounded-md ${report.status === "unsolved"
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
                                    {memberId === report.reporterId && (
                                        <button
                                            onClick={()=> {
                                                onOpen("deleteReport", { report: {
                                                    reportId: report._id,
                                                    title: report.title
                                                }})
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                        No {activeTab} reports found.
                    </p>
                )}
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div
                        className="bg-white dark:bg-[#292a3e] rounded-lg shadow-lg w-96 p-6 relative"
                        onClick={(e) => e.stopPropagation()} // Prevent click propagation to the background
                    >
                        <button
                            onClick={() => setSelectedReport(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                            {selectedReport.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            {selectedReport.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                            Reported by: {selectedReport.reporterId}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {new Date(selectedReport.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsList;
