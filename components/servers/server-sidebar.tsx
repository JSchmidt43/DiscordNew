"use client"

import { api } from '@/convex/_generated/api';
import { Channel, ChannelType, Member, MemberRole, MemberWithProfiles, roleHierarchy, ServerWithChannelsWithMembers } from '@/types';
import { Crown, Hash, Mic, ShieldAlert, ShieldCheck, Video } from 'lucide-react';
import React, { useEffect } from 'react'
import { ServerHeader } from './server-header';
import { useQuery } from 'convex/react';
import { ScrollArea } from '../ui/scroll-area';
import { ServerSearch } from './server-search';
import { Separator } from '../ui/separator';
import { ServerSection } from './server-section';
import { ServerChannel } from './server-channel';
import { ServerMember } from './server-member';
import toast from "react-hot-toast";

interface ServerSidebarProps {
  serverId: string;
  profileId: string;
  isMobileHeader?: boolean;
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />
};

const roleIconMap: Record<MemberRole, JSX.Element | null> = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 text-rose-500" />,
  [MemberRole.CREATOR]: <Crown className="h-4 w-4 text-yellow-500" />,
};


const ServerSidebar = ({
  serverId,
  profileId,
  isMobileHeader = false
}: ServerSidebarProps) => {

  const server  = useQuery(api.servers.getServerWithMembersAndChannelsByServerId, {
    serverId
  })?.data;

  console.log(server)

  const textChannels = server?.channels.filter(
    (channel: Channel) => channel.type === ChannelType.TEXT
  );
  const audioChannels = server?.channels.filter(
    (channel: Channel) => channel.type === ChannelType.AUDIO
  );
  const videoChannels = server?.channels.filter(
    (channel: Channel) => channel.type === ChannelType.VIDEO
  );


  // Extract profileIds from members
  const role = server?.members.find((member) => member.profileId === profileId)
    ?.role;

  // Extract profile IDs if server members exist
  const profileIds: string[] = server?.members?.map((member) => member.profileId) || [];


  // Always call useQuery, but provide an empty array as a fallback if profileIds is empty
  const profilesWithStatus = useQuery(api.profiles.get_profiles_By_Ids, {
    profileIds: profileIds.length > 0 ? profileIds : []
  })?.data || [];


  // Process members with their statuses
  const membersWithStatus = server?.members?.map((member) => {
    const profileStatus = profilesWithStatus?.find(
      (profile: any) => profile?._id === member.profileId
    );
    return {
      ...member,
      profile: profileStatus || null,
    };
  }) || [];

  const sortMembersByRole = (members: any[]) => {
    return members?.sort((a: any, b: any) => {
      return (roleHierarchy[b.role] || 0) - (roleHierarchy[a.role] || 0);
    });
  };

  const systemMessages = useQuery(api.systemMessages.getAllMessageByServerId, { serverId })?.data
  const member = useQuery(api.members.getMemberByServerIdAndProfileId, { profileId, serverId })?.data

  useEffect(() => {
    // Check if any system message has action 'KICK' and memberId matches the current user's memberId
    const kickedMessage = systemMessages?.find(
      (sys) => sys.action === "KICK" && sys.memberId === member?._id
    );

    if (kickedMessage) {
      toast.error(`You have been kicked out of the server '${server?.name}'`); // Show toaster notification
      setTimeout(() => {
          window.location.reload(); // Refresh the page after a brief delay
      }, 3000); // Delay to allow the user to read the message
  }

  }, [systemMessages?.length, member?._id]); // Only logs when length changes

  return (
    <div className='flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]'>
      {server && (<ServerHeader server={server} role={role} isMobile={isMobileHeader} />)}
      <ScrollArea className='flex-1 px-3'>
        <div className='mt-2'>
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel._id,
                  name: channel.name,
                  icon: iconMap[channel.type as ChannelType],
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  id: channel._id,
                  name: channel.name,
                  icon: iconMap[channel.type as ChannelType],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  id: channel._id,
                  name: channel.name,
                  icon: iconMap[channel.type as ChannelType],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: membersWithStatus?.map((member) => ({
                  id: member._id,
                  name: member.profile?.username || "User",
                  icon: roleIconMap[member.role as MemberRole],
                })),
              },
            ]}
          />
        </div>
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        {server && !!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={role}
              label="Text Channels"
            />
            <div className="space-y-[2px]">
              {textChannels.map((channel) => (
                <ServerChannel
                  key={channel._id}
                  channel={channel}
                  role={role as MemberRole}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {server && !!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.AUDIO}
              role={role}
              label="Voice Channels"
            />
            <div className="space-y-[2px]">
              {audioChannels.map((channel) => (
                <ServerChannel
                  key={channel._id}
                  channel={channel}
                  role={role as MemberRole}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {server && !!videoChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.VIDEO}
              role={role}
              label="Video Channels"
            />
            <div className="space-y-[2px]">
              {videoChannels.map((channel) => (
                <ServerChannel
                  key={channel._id}
                  channel={channel}
                  role={role as MemberRole}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!server?.members?.length && (
          <div className='mb-2'>
            <ServerSection
              sectionType='members'
              role={role}
              label="Members"
              server={server}
            />
            <div className='space-y-[2px]'>
              {sortMembersByRole(server?.members)?.map((member) => (
                <ServerMember
                  key={member._id}
                  member={member}
                  server={server} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default ServerSidebar