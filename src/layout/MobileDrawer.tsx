import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { CloseIcon } from "../lib/icons";

/** Below lg the sidebar becomes a slide-in drawer (the desktop nav is display:none). */
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-[19rem] max-w-[85vw] bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-white/10 overflow-y-auto mint-scroll">
        <div className="flex items-center justify-end h-14 px-4">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="px-4 pb-10">
          <Sidebar inDrawer />
        </div>
      </div>
    </div>
  );
}
