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
    currentUser: Member | null
}

const roleIconMap = {
    GUEST: null,
    MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
    ADMIN: <ShieldAlert className="h-4 w-4 text-rose-500" />,
    CREATOR: <Crown className="h-4 w-4 text-yellow-500" />
};

const UserInfoModel: React.FC<UserInfoModelProps> = ({ isOpen, onClose, memberProfile, currentUser }) => {
    // Function to determine if the current user can see the member ID
    const canSeeMemberId = () => {
        if (!currentUser) return false;

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
                    <DialogTitle>Member Information</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    {memberProfile && (
                        <>
                            <img src={memberProfile.profile.imageUrl} alt={memberProfile.profile.username} className="rounded-full w-20 h-20 mb-4 m-auto" />
                            {canSeeMemberId() ? (
                                <p>
                                    <strong>Member ID:</strong> {memberProfile._id} {/* Assuming memberProfile has an id */}
                                </p>
                            ) : (
                                <p><strong>Member ID:</strong> xxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                            )}
                            <p><strong>Username:</strong> {memberProfile.profile.username}</p>
                            <p><strong>Email:</strong> {memberProfile.profile.email}</p>
                            <div className="flex items-center">
                                <p className="mr-2"><strong>Role:</strong> {memberProfile.role}</p>
                                {roleIconMap[memberProfile.role]} {/* Render the icon here */}
                            </div>        
                            <p><strong>Current Status:</strong> {memberProfile.profile.status}</p>
                                               
                            <p>
                                <strong>Joined:</strong> {formatDate(new Date(memberProfile.createdAt))} {/* Format the date */}
                            </p>

                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserInfoModel;