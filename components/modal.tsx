import { ReactNode, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null; // Ensure modal is only rendered if `isOpen` is true

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed background */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

      {/* Modal content */}
      <div
        ref={modalRef}
        className="dark:bg-[#1E1F22] bg-[#E3E5E8] p-6 rounded-lg shadow-lg max-w-md w-full relative z-10"
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Modal content */}
        {children}
      </div>
    </div>
  );
};
