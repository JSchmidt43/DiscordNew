"use client";
import { useModel } from "@/hooks/use-model-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Member, MemberRole, MemberWithProfiles, Profile, ServerWithChannelsWithMembers, ServerWithMembersWithProfiles } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { UserAvatar } from "../user-avatar";
import { Check, Crown, Loader2, MoreVertical, Shield, ShieldAlert, ShieldCheck, ShieldQuestion, UserMinusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../ui/dropdown-menu";
import UserInfoModel from "./userinfo-model";
import axios from "axios";
import qs from "query-string";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 text-rose-500" />,
  CREATOR: <Crown className="h-4 w-4 text-yellow-500" />
};

// Define role hierarchy
const roleHierarchy = {
  CREATOR: 4,
  ADMIN: 3,
  MODERATOR: 2,
  GUEST: 1
};

const MembersModel = () => {
  const { onOpen, isOpen, onClose, type, data } = useModel();
  const [loadingId, setLoadingId] = useState("");
  const [isUserInfoOpen, setUserInfoOpen] = useState(false); // State for user info dialog
  const [selectedProfile, setSelectedProfile] = useState<MemberWithProfiles | null>(null); // Selected profile data

  const isModelOpen = isOpen && type === "members";
  const { server } = data as { server: ServerWithChannelsWithMembers };
  const router = useRouter();
  const memberRef = useRef(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  // Fetch the user's profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Update memberRef when profile or data changes
  useEffect(() => {
    if (server?.members && profile) {
      const foundMember = server?.members.find(
        (mbm: Member) => mbm.profileId === profile._id
      );
      if (foundMember) {
        memberRef.current = foundMember;
        setRenderKey((prevKey) => prevKey + 1); // Force re-render
      }
    }
  }, [data, profile]);

  // Function to check if the current user has a higher role than the member
  const hasHigherRole = (currentRole: MemberRole, memberRole: MemberRole) => {
    return roleHierarchy[currentRole] > roleHierarchy[memberRole];
  };

  // Function to check if the current user is a moderator
  const isModerator = (role: MemberRole) => {
    return role === "MODERATOR";
  };

  // Handle opening the user info dialog
  const handleOpenUserInfo = (member: MemberWithProfiles) => {
    setSelectedProfile(member); // Set the selected profile
    setUserInfoOpen(true); // Open the dialog
  };

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);
      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`
      });

      // Call the API to update the member's role
      const response = await axios.patch(url, {
        memberId: memberId,
        role: role
      });

      router.refresh();
      onOpen("members", { server: response.data.data})

    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };
  // Kick a member from the server
  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);
      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`
      });

      const response = await axios.delete(url);

      router.refresh();
      onOpen("members", { server: response.data.data });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  const sortMembersByRole = (members: MemberWithProfiles[]) => {
    return members?.sort((a: MemberWithProfiles, b: MemberWithProfiles) => {
      return (roleHierarchy[b.role] || 0) - (roleHierarchy[a.role] || 0);
    });
  };
  

  return (
    <>
    <Dialog open={isModelOpen && type === "members"} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#1e1f22] text-black dark:text-white overflow-hidden">
        <DialogHeader className="pt-4 px-4">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-2xl  font-bold">
              <img
                src="/logo.png"
                alt="logo"
                width={50}
                height={50}
                className="object-cover mb-2"
              />
              Manage Members
            </DialogTitle>
          </div>

          <DialogDescription
            className="text-left text-zinc-500">
            {server?.members?.length} {server?.members?.length === 1 ? 'Member' : 'Members'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {sortMembersByRole(server?.members)?.map((member: MemberWithProfiles) => (
            <div key={member?._id} className="flex items-center gap-x-2 mb-6">
              <div className="hover:cursor-pointer" onClick={()=>handleOpenUserInfo(member)}>
                <UserAvatar src={member?.profile?.imageUrl}/>

              </div>
                <div className="flex flex-col gap-y-1">
                  <div className="text-sm font-semibold flex items-center gap-x-1">
                      {member?.profile?.username}
                      {roleIconMap[member.role]}
                  </div>
                  <p className="text-xs text-zinc-500">{member?.profile?.email}</p>
                </div>
                {server?.creatorId !== member.profileId && loadingId !== member._id &&
                  hasHigherRole(memberRef.current?.role, member.role) && (
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="h-4 w-4 text-zinc-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left">
                          {!isModerator(memberRef.current?.role) && ( // Show role options only for non-moderators
                            <>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="flex items-center">
                                  <ShieldQuestion className="w-4 h-4 mr-2" />
                                  <span>Role</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    {memberRef.current?.role === "CREATOR" && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            onRoleChange(member._id, MemberRole.ADMIN);
                                          }}
                                        >
                                          <ShieldAlert className="h-4 w-4 mr-2" />
                                          Admin
                                          {member.role === "ADMIN" && (
                                            <Check className="h-4 w-4 text-green-600 ml-2" />
                                          )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => onRoleChange(member._id, MemberRole.MODERATOR)}
                                        >
                                          <ShieldCheck className="h-4 w-4 mr-2" />
                                          Moderator
                                          {member.role === "MODERATOR" && (
                                            <Check className="h-4 w-4 text-green-600 ml-2" />
                                          )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => onRoleChange(member._id, MemberRole.GUEST)}
                                        >
                                          <Shield className="h-4 w-4 mr-2" />
                                          Guest
                                          {member.role === "GUEST" && (
                                            <Check className="h-4 w-4 text-green-600 ml-auto" />
                                          )}
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {memberRef.current?.role === "ADMIN" && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => onRoleChange(member._id, MemberRole.MODERATOR)}
                                        >
                                          <ShieldCheck className="h-4 w-4 mr-2" />
                                          Moderator
                                          {member.role === "MODERATOR" && (
                                            <Check className="h-4 w-4 text-green-600 ml-auto" />
                                          )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => onRoleChange(member._id, MemberRole.GUEST)}
                                        >
                                          <Shield className="h-4 w-4 mr-2" />
                                          Guest
                                          {member.role === "GUEST" && (
                                            <Check className="h-4 w-4 text-green-600 ml-auto" />
                                          )}
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                            </>
                          )}

                          <DropdownMenuItem onClick={() => onKick(member._id)}>
                            <UserMinusIcon className="h-4 w-4 mr-2" />
                            Kick
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                  )}
            {loadingId === member._id && (
              <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4" />
            )}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
     <UserInfoModel
        isOpen={isUserInfoOpen}
        onClose={() => setUserInfoOpen(false)}
        memberProfile={selectedProfile}
        currentUser={memberRef.current}
      />
    </>
  );
};

export default MembersModel;
