import { ChatHeader } from '@/components/chat/chat-header'
import { DirectChatInput } from '@/components/directMessages/direct-message-chatInput'
import { DirectChatMessage } from '@/components/directMessages/direct-message-chatMessages'
import { api } from '@/convex/_generated/api'
import { currentProfile } from '@/lib/current-profile'
import { auth } from '@clerk/nextjs/server'
import { fetchQuery } from 'convex/nextjs'
import React from 'react'

interface DirectMessagePageProps {
  params: {
    directMessageId: string
  }
}

const DirectMessageIdPage = async ({
  params
}: DirectMessagePageProps) => {
  const profile = await currentProfile();
  if(!profile){
    return auth().redirectToSignIn();
  }

  const getReceiverProfile = (await fetchQuery(api.friends.getReceiverFriendProfile, { profileId : profile._id, friendshipId: params.directMessageId }))?.data




  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={getReceiverProfile?.username || "Unknown"}
        type='conversation'
        imageUrl={getReceiverProfile?.imageUrl}
      />
      <DirectChatMessage
          name={getReceiverProfile?.username || "Unknown"}
          friendshipId={params.directMessageId}
          profile={profile}
      />
      <DirectChatInput
          name={getReceiverProfile?.username || "Unknown"}
          sender={profile._id}
          receiver={getReceiverProfile?._id!}
      
      />
    
    </div>
  )
}

export default DirectMessageIdPage