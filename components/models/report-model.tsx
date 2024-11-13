"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Report, ServerWithChannelsWithMembers } from "@/types"; // Assuming you have a type for reports
import { useModel } from "@/hooks/use-model-store";
import { PlusIcon } from "lucide-react";


const ReportModel = () => {
    const { onOpen, isOpen, onClose, type, data } = useModel();
    const [activeTab, setActiveTab] = useState<"unsolved" | "solved">("unsolved");
    const [reports, setReports] = useState<Report[]>([]);
    const [isReportModalOpen, setReportModalOpen] = useState(false);

    const isModelOpen = isOpen && type === "report";


    useEffect(() => {
        const fetchReports = async () => {
            // Fetch reports based on activeTab and serverId
            // const reportsData = await api.reports.getReportsByStatus({ serverId: server.id, status: activeTab });
            // setReports(reportsData);
        };

        fetchReports();
    }, [activeTab, data.server?._id]); // Make sure to use `server.id`

    const handleAddReport = () => {
        // Logic for adding a report (open a modal or form to add a report)
        setReportModalOpen(true);
    };

    return (
        <Dialog open={isModelOpen} onOpenChange={onClose}>
            <DialogContent className="w-[800px] p-8 bg-white dark:bg-[#1e1f22] rounded-lg shadow-lg">
                <DialogHeader>
                    <div className="flex justify-between items-center ">
                        <DialogTitle className="text-xl font-semibold ">Reports</DialogTitle>
                        <Button
                            variant="default"
                            onClick={handleAddReport}
                            className="flex items-center space-x-2 bg-white dark:bg-[#1e1f22] text-black dark:text-white
               border border-transparent dark:border-white
               hover:border-gray-300 dark:hover:border-gray-200"
                        >
                            <PlusIcon className="w-5 h-5 text-zinc-500" />
                            <span className="text-sm">Add Report</span>
                        </Button>

                    </div>
                    <div className="flex justify-between mt-4 space-x-4">
                        <Button
                            variant={activeTab === "unsolved" ? "default" : "outline"}
                            onClick={() => setActiveTab("unsolved")}
                            className="flex-1"
                        >
                            Unsolved Reports
                        </Button>
                        <Button
                            variant={activeTab === "solved" ? "default" : "outline"}
                            onClick={() => setActiveTab("solved")}
                            className="flex-1"
                        >
                            Solved Reports
                        </Button>
                    </div>
                </DialogHeader>

                {/* List of Reports */}
                <div className="mt-6">
                    {reports.length === 0 ? (
                        <p className="text-center text-zinc-500">No {activeTab} reports.</p>
                    ) : (
                        <ul className="space-y-4">
                            {reports.map((report) => (
                                <li
                                    key={report.id}
                                    className="p-6 bg-zinc-50 border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-100 transition-colors"
                                >
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-zinc-800">{report.title}</span>
                                        <span className="text-xs text-zinc-500">{report.date}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-zinc-700">{report.description}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReportModel;
