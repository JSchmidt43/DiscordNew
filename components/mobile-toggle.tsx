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

export const MobileToggle = async ({
    serverId
}: { serverId: string}) =>  {

    const profile = await currentProfile();

    return(
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex gap-0">
                <div className="w-[72px]">
                    <NavigationSideBar profileId={profile?._id!}/>
                </div>
                <ServerSidebar profileId={profile?._id!} serverId={serverId} isMobileHeader={true}/>
            </SheetContent>
        </Sheet>
    )
}