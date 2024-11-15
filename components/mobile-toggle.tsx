import { Menu } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet"
import { Button } from "./ui/button"
import { NavigationSideBar } from "./navigation/navigation-sidebar"
import ServerSidebar from "./servers/server-sidebar"
import { currentProfile } from "@/lib/current-profile"
import DirectMessageSidebar from "./directMessages/direct-message-sidebar"
import { DialogTitle } from "@radix-ui/react-dialog"

export const MobileToggle = async ({
    serverId,
}: { serverId?: string}) =>  {

    const profile = await currentProfile();

    // Determine which sidebar to render based on the available ID
    const renderSidebar = () => {
        if (serverId) {
            return <ServerSidebar profileId={profile?._id!} serverId={serverId} isMobileHeader={true} />
        } else {
            return <DirectMessageSidebar profileId={profile?._id!} isMobileHeader={true} />
        } 
    }

    return(
        <Sheet>
            <DialogTitle></DialogTitle>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu/>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex gap-0">
                <div className="w-[72px]">
                    <NavigationSideBar profileId={profile?._id!}/>
                </div>
                {renderSidebar()}
            </SheetContent>
        </Sheet>
    )
}