import { Server, Channel, Profile, Message, Member, ServerWithChannelsWithMembers, ServerWithMembersWithProfiles, ChannelType, Report } from "@/types";
import { create } from "zustand"

export type ModelType = "createServer" | "invite" | "editServer" 
| "members" | "createChannel" | "leaveServer" | "deleteServer"
| "deleteChannel" | "editChannel" | "messageFile" | "deleteMessage" | "joinServer"
 | "serverChoice" | "deleteDirectMessage" | "directMessageFile" | "reports" | "deleteReport";

interface ModelData {
    server?: Server;
    channel?:Channel;
    report?: {
        reportId: string,
        title: string
    },
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
    },
    deleteDirectMessage?: {
        messageId: string,
        profileId: string
    },
    directMessageFileData?: {
        sender: string,
        receiver: string
    },
    reports?: {
        serverId: string,
        reporterId: string,
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