import { ReactNode, useEffect, useState } from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, X } from "lucide-react";

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}

function useInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const visits = parseInt(localStorage.getItem("visit_count") || "0") + 1;
    localStorage.setItem("visit_count", String(visits));
    const dismissed = localStorage.getItem("install_dismissed");

    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      if (visits >= 3 && !dismissed) setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setShow(false);
    }
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("install_dismissed", "1");
  };

  return { show, install, dismiss };
}

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const online = useOnlineStatus();
  const { show: showInstall, install, dismiss } = useInstallPrompt();

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex justify-center w-full">
      <div className="w-full max-w-md bg-background min-h-[100dvh] flex flex-col relative sm:border-x sm:shadow-2xl overflow-hidden">
        
        {/* Offline Banner */}
        <AnimatePresence>
          {!online && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-primary px-4 py-2.5 flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-white flex-shrink-0" />
                <span className="text-white text-xs font-bold">You're offline — showing cached content</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Install Prompt */}
        <AnimatePresence>
          {showInstall && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-zinc-900 px-4 py-3 flex items-center gap-3">
                <span className="text-base">📱</span>
                <span className="flex-1 text-white text-xs font-bold">Add Fetch to your home screen</span>
                <button
                  onClick={install}
                  className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                >
                  Install
                </button>
                <button onClick={dismiss} className="text-zinc-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-hide pb-24 relative">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
