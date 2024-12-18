"use client"

import { Plus } from "lucide-react"
import { ActionTooltip } from "../action-toolkit"
import { useModel } from "@/hooks/use-model-store";
import { Profile } from "@/types";


export const NavigationAction = ({ profile }: { profile: Profile}) => {
     const { onOpen } = useModel();

    return (
        <div> 
            <ActionTooltip
             side="right"
             align="center"
             label="Add a server">
                <button 
                    onClick={()=>onOpen("serverChoice", {profile})}
                    className="group flex items-center mt-2">
                    <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px]
                    group-hover:rounded-[16px] transition-all overflow-hidden
                    items-center justify-center bg-background dark:bg-neutral-700
                    group-hover:bg-emerald-500">
                        <Plus
                        className="group-hover:text-white transition text-emerald-500"
                        size={25}/>
                    </div>
                </button>
            </ActionTooltip>
        </div>
    )
}