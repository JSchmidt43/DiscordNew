import { NavigationSideBar } from "@/components/navigation/navigation-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

const MainLayout = async ({ children} : { children : React.ReactNode}) => {
    
    const profile = await currentProfile();
    if(!profile){
        return redirect("/")
    }
   
    return (
        <div className="h-full">
            <div className="invisible md:visible md:flex h-full w-[72px]
            z-30 flex-col fixed inset-y-0">
                <NavigationSideBar profileId={profile._id}/>
            </div>
            <main className="md:pl-[72px] h-full">
                {children}

            </main>
        </div>
      );
}
 
export default MainLayout;