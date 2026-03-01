import { Search, ScanLine, List as ListIcon, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

export default function BottomNav() {
  const [location] = useLocation();

  const tabs = [
    { name: "Home", href: "/", icon: Search },
    { name: "Scan", href: "/scan", icon: ScanLine },
    { name: "Lists", href: "/lists", icon: ListIcon },
    { name: "Profile", href: "/profile", icon: User },
  ];

  // Also match active state for sub-routes
  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 glass-nav border-t border-zinc-100 px-6 pb-safe pt-2 z-50">
      <div className="flex items-center justify-between pb-3 pt-1">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          
          return (
            <Link key={tab.name} href={tab.href} className="relative flex flex-col items-center gap-1 p-2 min-w-[64px]">
              <div className="relative">
                <Icon 
                  size={24} 
                  strokeWidth={active ? 2.5 : 2} 
                  className={`transition-colors duration-300 ${active ? "text-primary" : "text-zinc-400"}`}
                />
                {active && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -inset-2 bg-primary/10 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors duration-300 ${active ? "text-primary" : "text-zinc-400"}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
