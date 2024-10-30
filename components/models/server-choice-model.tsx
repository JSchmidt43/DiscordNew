"use client";
import { useModel } from "@/hooks/use-model-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "../ui/separator";

const ServerChoiceModel = () => {
  const { onOpen, onClose, isOpen, type } = useModel();
  
  // Check if the modal should be open
  const isModelOpen = isOpen && type === "serverChoice";

  const handleCreateServer = () => {
    onClose(); // Close the choice model
    onOpen("createServer"); // Open create server model
  };

  const handleJoinServer = () => {
    onClose(); // Close the choice model
    onOpen("joinServer"); // Open join server model
  };

  return (
    <Dialog open={isModelOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#383338] text-black dark:text-white p-0 overflow-hidden">
        
        
        <div className="flex justify-center">
          {/* Left div: Join a Server */}
          <div
            onClick={handleJoinServer}
            className="flex-1 flex items-center justify-center dark:bg-[#1e1f22] cursor-pointer hover:bg-gray-400 dark:hover:bg-[#36393f] transition-colors"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black dark:text-white">Join a Server</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Enter the server link and connect with others.</p>
            </div>
          </div>

          <Separator orientation="vertical" className="h-48" />

          {/* Right div: Create a Server */}
          <div
            onClick={handleCreateServer}
            className="flex-1 flex items-center justify-center dark:bg-[#1e1f22] cursor-pointer hover:bg-gray-400 dark:hover:bg-[#36393f] transition-colors"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black dark:text-white">Create a Server</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Customize and create your own server.</p>
            </div>
          </div>
        </div>
        
      </DialogContent>
    </Dialog>
  );
};

export default ServerChoiceModel;
