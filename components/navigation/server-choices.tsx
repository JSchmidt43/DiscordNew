"use client";
import { useModel } from "@/hooks/use-model-store";
import { Separator } from "../ui/separator";

const ServerPage = () => {
  const { onOpen, onClose } = useModel();

  // Function to handle div clicks
  const handleCreateServer = () => {
      onClose(); // Close any open model
      onOpen("createServer"); // Open create server model
  };

  const handleJoinServer = () => {
      onClose(); // Close any open model
      onOpen("joinServer"); // Open join server model
  };

  return (
    <div className="flex justify-center">
      {/* Left div: Join a Server */}
      <div
        onClick={handleJoinServer}
        className="flex-1 flex items-center justify-center dark:bg-[#202225] cursor-pointer hover:bg-gray-400 dark:hover:bg-[#36393f] transition-colors"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Join a Server
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter the server link and connect with others.
          </p>
        </div>
      </div>

      {/* Horizontal Separator without margins */}
      <Separator orientation="vertical" className="h-48" /> {/* Adjust height as needed */}

      {/* Right div: Create a Server */}
      <div
        onClick={handleCreateServer}
        className="flex-1 flex items-center justify-center hover:bg-gray-400 dark:bg-[#202225] cursor-pointer dark:hover:bg-[#36393f] transition-colors"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Create a Server
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Customize and create your own server.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerPage;
