"use client"

import { useEffect, useState } from "react"
import CreateServerModel from "../models/create-server-model"


export const ModelProvider = () => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(()=>{
        setIsMounted(true)
    }, [])

    if(!isMounted) return null;

    return (
        <>
            <CreateServerModel/>
            {/* <JoinServerModel/>
            <InviteModel/>
            <EditServerModel/>
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






