"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Member, MemberRole, MemberWithProfiles } from "@/types";
import { Crown, ShieldAlert, ShieldCheck } from "lucide-react";

interface UserInfoModelProps {
    isOpen: boolean;
    onClose: () => void;
    memberProfile: MemberWithProfiles | null; // Profile data passed as prop
    currentUser: MemberWithProfiles | undefined | null
}

// Define roleIconMap with proper typing
const roleIconMap: Record<MemberRole, JSX.Element | null> = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
    [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 text-rose-500" />,
    [MemberRole.CREATOR]: <Crown className="h-4 w-4 text-yellow-500" />,
  };

const UserInfoModel: React.FC<UserInfoModelProps> = ({ isOpen, onClose, memberProfile, currentUser }) => {
    // Function to determine if the current user can see the member ID
    const canSeeMemberId = () => {
        if (!currentUser || !memberProfile) return false;
    
        // If the current user is a Creator, they can see all member IDs
        if (currentUser.role === MemberRole.CREATOR) return true;
    
        // All other roles can see their own ID and others' IDs except for Creators
        return memberProfile?.role !== MemberRole.CREATOR;
    };
    
    // Format date to a readable string
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-[#1e1f22] text-black dark:text-white">
                <DialogHeader>
                    <DialogTitle className="text-red-500">Member Information</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    {memberProfile && (
                        <>
                            <img src={memberProfile?.profile?.imageUrl} alt={memberProfile?.profile?.username} className="rounded-full w-20 h-20 mb-4 m-auto" />
                            {canSeeMemberId() ? (
                                <p>
                                    <strong className="text-red-500">Member ID:</strong> {memberProfile._id || "*NOT FOUND*" }{/* Assuming memberProfile has an id */}
                                </p>
                            ) : (
                                <p><strong className="text-red-500">Member ID:</strong> xxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                            )}
                            <p><strong className="text-red-500">Username:</strong> {memberProfile?.profile?.username || "*NOT FOUND*"}</p>
                            <p><strong className="text-red-500">Email:</strong> {memberProfile?.profile?.email || "*NOT FOUND*"}</p>
                            <div className="flex items-center">
                                <p className="mr-2" ><strong className="text-red-500">Role:</strong> {memberProfile?.role || "*NOT FOUND*"}</p>
                                {roleIconMap[memberProfile.role as MemberRole]} {/* Render the icon here */}
                            </div>        
                            <p><strong className="text-red-500">Current Status:</strong> {memberProfile?.profile?.status || "*NOT FOUND*"}</p>
                                               
                            <p>
                                <strong className="text-red-500">Joined:</strong> {formatDate(new Date(memberProfile?.createdAt || "*NOT FOUND*"))} {/* Format the date */}
                            </p>

                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserInfoModel;
