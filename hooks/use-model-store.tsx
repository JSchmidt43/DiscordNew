import { Server, Channel, Profile, Message, Member, ServerWithChannelsWithMembers, ServerWithMembersWithProfiles, ChannelType, Report, MemberWithProfiles } from "@/types";
import { create } from "zustand"

export type ModelType = "createServer" | "invite" | "editServer" 
| "members" | "createChannel" | "leaveServer" | "deleteServer"
| "deleteChannel" | "editChannel" | "messageFile" | "deleteMessage" | "joinServer"
 | "serverChoice" | "deleteDirectMessage" | "directMessageFile" | "createReport" | "deleteReport" | "report";

interface ModelData {
    server?: Server;
    channel?:Channel;
    reportData?: {
        report: any,
        currentUser: Member,
        members: MemberWithProfiles[]
    };
    channelType?: ChannelType,
    fileData?: {
        username: string,
        channelId: string,
        serverId: string | undefined,
        memberId: string
    },
    deleteReport?: {
        reportId: string,
        title: string
    };
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
    createReport?: {
        serverId: string,
        reporterId: string,
        membersWithProfiles: MemberWithProfiles[]
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