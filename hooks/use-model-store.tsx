import { Server, Channel, Profile, Message, Member } from "@/types";
import { create } from "zustand"

export type ModelType = "createServer" | "invite" | "editServer" 
| "members" | "createChannel" | "leaveServer" | "deleteServer"
| "deleteChannel" | "editChannel" | "messageFile" | "deleteMessage" | "joinServer" | "serverChoice";

interface ModelData {
    server?: Server;
    // serverChData?: ServerWithChannelsWithMembers;
    // serverMpData?: ServerWithMembersWithProfiles;
    channel?:Channel;
    // channelType?: ChannelType,
    apiUrl?: string,
    query?: Record<string,any>
}

interface ModelStore{
    type: ModelType | null;
    data: ModelData;
    isOpen:boolean;
    onOpen: (type:ModelType, data?: ModelData) => void;
    onClose: () => void;
}


export const useModel = create<ModelStore>((set) => ({
    type:null,
    data: {},
    isOpen: false,
    userData: undefined,
    onOpen:(type, data = {}) => set({ isOpen:true, type, data}),
    onClose: () => set({ type: null, isOpen: false})
}))