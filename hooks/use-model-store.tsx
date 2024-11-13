import { Server, Channel, Profile, Message, Member, ServerWithChannelsWithMembers, ServerWithMembersWithProfiles, ChannelType } from "@/types";
import { create } from "zustand"

export type ModelType = "createServer" | "invite" | "editServer" 
| "members" | "createChannel" | "leaveServer" | "deleteServer"
| "deleteChannel" | "editChannel" | "messageFile" | "deleteMessage" | "joinServer" | "serverChoice" | "report";

interface ModelData {
    server?: Server;
    channel?:Channel;
    channelType?: ChannelType,
    fileData?: {
        username: string,
        channelId: string,
        serverId: string | undefined,
        memberId: string
    },
    profile?: Profile,
    deleteMessage?: {
        memberId: string,
        messageId: string
    }
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
    onOpen:(type, data = {}) => set({ isOpen: true, type, data}),
    onClose: () => set({ type: null, isOpen: false})
}))