"use client"

import { api } from '@/convex/_generated/api';
import { Channel, ChannelType, Member, MemberRole, ServerWithChannelsWithMembers } from '@/types';
import { Crown, Hash, Mic, ShieldAlert, ShieldCheck, Video } from 'lucide-react';
import React from 'react'
import { ServerHeader } from './server-header';
import { useQuery } from 'convex/react';

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

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="w-4 h-4 mr-2 text-indigo-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="w-4 h-4 mr-2 text-rose-500" />,
  [MemberRole.CREATOR]: <Crown className="w-4 h-4 mr-2 text-yellow-500" />
}

const ServerSidebar = ({
  serverId,
  profileId,
  isMobileHeader = false
} : ServerSidebarProps) => {

  const server = useQuery(api.servers.getServerWithMembersAndChannelsByServerId, {
    serverId
  });


  const textChannels = server?.channels.filter(
    (channel : Channel) => channel.type === ChannelType.TEXT
  );
  const audioChannels = server?.channels.filter(
    (channel : Channel) => channel.type === ChannelType.AUDIO
  );
  const videoChannels = server?.channels.filter(
    (channel : Channel) => channel.type === ChannelType.VIDEO
  );

  const members = server?.members.filter((member) => member.profileId !== profileId);

  // Extract profileIds from members
  const role = server?.members.find((member: Member) => member.profileId === profileId)
    ?.role;

  // Extract profileIds from members
  const profileIds : string[] = server?.members.map((member : Member) => member.profileId)!;

  const profilesWithStatus = useQuery(api.profiles.get_profiles_By_Ids, {
     profileIds
  })

  return (
    <div className='flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]'>
      <ServerHeader server={server} role={role}/>
    </div>
  );
}

export default ServerSidebar