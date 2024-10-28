"use client"

import { useEffect, useState } from "react"
import CreateServerModel from "../models/create-server-model"
import InviteModel from "../models/invite-model"
import EditServerModel from "../models/edit-server-model"


export const ModelProvider = () => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(()=>{
        setIsMounted(true)
    }, [])

    if(!isMounted) return null;

    return (
        <>
            <CreateServerModel/>
            <InviteModel/>
            <EditServerModel/>
            {/* <JoinServerModel/>
            <MembersModel/>
            <CreateChannelModel/>
            <LeaveServerModel />
            <DeleteServerModel />
            <DeleteChannelModel/>
            <EditChannelModel/>
            <MessageFileModel />
            <DeleteMessageModel/>
            <ServerChoiceModel/> */}
        </>
    )
}






