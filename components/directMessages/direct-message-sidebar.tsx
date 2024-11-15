"use client"

import { api } from '@/convex/_generated/api';
import React, { useEffect, useState } from 'react'
import { useQuery } from 'convex/react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { DirectMessageSearch } from './direct-message-search';
import { useParams, useRouter } from 'next/navigation';

interface DirectMessageSidebarProps {
  profileId: string;
  isMobileHeader?: boolean;
}

const DirectMessageSidebar = ({
    profileId,
    isMobileHeader = false
  }: DirectMessageSidebarProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
      setIsMounted(true);
    }, []);
  
    const getFriends = useQuery(api.friends.getFriendsById, { profileId })?.data;
    const friends = getFriends || [];

    const handleFriendClick = (friendId: string) => {
        router.push(`/directMessages/${friendId}`);
    };
  
    return (
      <div className='flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]'>
        <h2 className='ml-2 font-bold m-2'>Direct Messages</h2>
        <ScrollArea className='flex-1 px-3'>
          <div className='mt-2'>
            {isMounted && (
              <DirectMessageSearch
                data={[
                  {
                    label: "Friends",
                    type: "friends",
                    data: friends?.map((friend) => ({
                      id: friend._id,
                      name: friend.friendProfile.username || "User",
                      image: friend.friendProfile.imageUrl,
                    })),
                  },
                ]}
              />
            )}
          </div>
          <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
          {!!friends?.length  && (
            <div className='mb-2'>
                <div className='space-y-[2px]'>
                <p className='font-bold'>Friends</p>
                {friends.map((friend) => {
                  // Determine if the friend is the selected one (i.e., the current active DM)
                  const isActive = params.directMessageId === friend._id;
                  return (
                    <div
                      key={friend.friendProfile._id}
                      className={`
                        flex items-center gap-3 p-2 rounded-md hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 cursor-pointer
                        ${isActive ? 'bg-zinc-700/10 dark:bg-zinc-700/50' : ''}
                      `}
                      onClick={() => handleFriendClick(friend._id)}
                    >
                      <div className={`
                        absolute left-0 bg-primary rounded-r-full transition-all w-[4px]
                        ${isActive ? 'h-[36px]' : 'group-hover:h-[20px]'}
                      `}></div>
                      <img
                        src={friend.friendProfile.imageUrl}
                        alt={friend.friendProfile.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {friend.friendProfile.username || 'User'}
                      </span>
                    </div>
                  );
                })}
                </div>
            </div>
          )

          }
        </ScrollArea>
      </div>
    );
  };
export default DirectMessageSidebar