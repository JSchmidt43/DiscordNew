// interface for the profiles table
export interface Profile {
    _id: string,
    name: string; // Profile name
    username: string; // Username, must be unique
    password?: string; // Optional password (consider hashing)
    email: string; // User email
    imageUrl: string; // URL for the profile image
    status: string; // User status
    userId: string; // ID of the associated user
    createdAt: number; // Creation date
    updatedAt: number; // Last updated date
}
  
  // interface for the servers table
export interface Server {
    _id: string,
    name: string; // Server name
    imageUrl: string; // URL for the server image
    inviteCode: string; // Unique invite code for the server
    creatorId: string; // ID of the creator profile
    members: string[]; // Array of member IDs
    channels: string[]; // Array of channel IDs
    createdAt: number; // Creation date
    updatedAt: number; // Last updated date
}
  
  // interface for the members table
export interface Member {
    _id: string,
    role: string; // Member role (CREATOR, ADMIN, etc.)
    profileId: string; // ID of the associated profile
    serverId: string; // ID of the associated server
    messages: string[]; // Array of message IDs
    createdAt: number; // Creation date
    updatedAt: number; // Last updated date
}
  
  // interface for the channels table
export interface Channel {    
    _id: string,
    name: string; // Channel name
    type: string; // Channel type (TEXT, AUDIO, VIDEO, etc.)
    creatorId: string; // ID of the associated profile
    serverId: string; // ID of the associated server
    messages: string[]; // Array of message IDs
    createdAt: number; // Creation date
    updatedAt: number; // Last updated date
}
  
  // interface for the messages table
export interface Message {
    _id: string,
    content: string; // Message content
    fileUrl?: string; // Optional file URL
    memberId?: string; // ID of the member sending the message
    username: string; // Username of the sender
    channelId: string; // ID of the channel
    deleted: boolean; // Deletion status
    createdAt: number; // Creation date
    updatedAt: number; // Last updated date
}

  // interface for the Direct messages table
  export interface DirectMessages {
    _id: string,
    content: string; // Message content
    fileUrl?: string; // Optional file URL
    sender: string;
    receiver: string;
    friendshipId: string;

    deleted: boolean; // Deletion status
    createdAt: number; // Creation date
    updatedAt: number; // Last updated date
}


// interface for the friends table
export interface Friends {
  _id: string,
  sender: string,
  receiver: string,
  status: string,
  createdAt: number; // Creation date
  updatedAt: number; // Last updated date
}

export interface Report {
  id: string;               // Unique identifier for the report
  reporterId:string,
  reporterUsername: string,
  reportedMemberId: string,
  title:string,
  description: string,
  status: "unsolved" | "pending" | "solved",
  tags: string[],
  reportedMemberRole: string,
  serverId: string,


  createdAt: number,
  updatedAt: number
}

export interface FriendRequestWithProfile {
  _id: string;
  createdAt: number;
  updatedAt: number;
  sender: string;
  receiver: string;
  status: string;
  // senderProfile: Profile
}

  
export enum ChannelType {
  TEXT = "TEXT",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO"
}

export enum MemberRole {
  CREATOR = "CREATOR",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  GUEST = "GUEST"
}


export type ServerWithChannelsWithMembers = {
  _id: string,
  name: string; // Server name
  imageUrl: string; // URL for the server image
  inviteCode: string; // Unique invite code for the server
  creatorId: string; // ID of the creator profile
  members: MemberWithProfiles[]
  channels: Channel[]
  createdAt: number; // Creation date
  updatedAt: number; // Last updated date
}


export type MemberWithProfiles = {
  _id: string,
  role: string; // Member role (CREATOR, ADMIN, etc.)
  profileId: string; // ID of the associated profile
  serverId: string; // ID of the associated server
  messages: string[]; // Array of message IDs
  createdAt: number; // Creation date
  updatedAt: number; // Last updated date
  profile: {
    _id: string,
    name: string; // Profile name
    username: string; // Username, must be unique
    password?: string; // Optional password (consider hashing)
    email: string; // User email
    imageUrl: string; // URL for the profile image
    status: string; // User status
    userId: string; // ID of the associated user
    createdAt: number; // Creation date
    updatedAt: number; // Last updated date
  } | null
}

export type FriendsWithProfiles = Friends & {
  friendProfile: Profile
}

// Define role hierarchy
export const roleHierarchy: Record<string, number> = {
  [MemberRole.CREATOR]: 4,
  [MemberRole.ADMIN]: 3,
  [MemberRole.MODERATOR]: 2,
  [MemberRole.GUEST]: 1
};


