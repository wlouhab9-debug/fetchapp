import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const SCREENS = [
  {
    icon: (
      <div className="relative w-40 h-40 mx-auto">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
        <div className="absolute inset-4 bg-primary/20 rounded-full flex items-center justify-center">
          <span className="text-6xl">🔍</span>
        </div>
      </div>
    ),
    title: "Find Anything Near You",
    subtitle: "Search, scan, or photograph any product — we'll find it at stores near you in seconds.",
  },
  {
    icon: (
      <div className="grid grid-cols-3 gap-4 w-full max-w-[240px] mx-auto">
        {[
          { emoji: "📷", label: "Snap a photo" },
          { emoji: "📸", label: "Scan barcode" },
          { emoji: "⌨️", label: "Type to search" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
              {item.emoji}
            </div>
            <span className="text-[10px] font-bold text-zinc-500 text-center leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    ),
    title: "Three Ways to Fetch",
    subtitle: "Snap a photo to identify products, scan a barcode for instant results, or just type your search.",
  },
  {
    icon: (
      <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-emerald-50 rounded-full" />
        <div className="relative flex flex-col items-center">
          <span className="text-5xl">💰</span>
          <div className="mt-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
            Save $12.43 today!
          </div>
        </div>
      </div>
    ),
    title: "Always Get the Best Price",
    subtitle: "Compare prices across nearby stores and get it delivered fast — never overpay again.",
  },
];

interface OnboardingProps {
  onFinish?: () => void;
}

export default function Onboarding({ onFinish }: OnboardingProps) {
  const [screen, setScreen] = useState(0);
  const [, setLocation] = useLocation();

  const finish = () => {
    if (onFinish) {
      onFinish();
    } else {
      localStorage.setItem("onboarding_done", "1");
      setLocation("/");
    }
  };

  const next = () => {
    if (screen < SCREENS.length - 1) setScreen(screen + 1);
    else finish();
  };

  const current = SCREENS[screen];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex justify-end p-6">
        <button onClick={finish} className="text-zinc-400 font-bold text-sm hover:text-zinc-600">
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col items-center text-center gap-8 w-full"
          >
            <div className="h-48 flex items-center justify-center w-full">
              {current.icon}
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-black text-zinc-900 leading-tight">{current.title}</h2>
              <p className="text-zinc-500 text-base leading-relaxed max-w-[280px] mx-auto">
                {current.subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2">
          {SCREENS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === screen ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-zinc-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-8 flex flex-col gap-4">
        {screen === SCREENS.length - 1 ? (
          <Button
            onClick={finish}
            className="h-16 bg-primary text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/30"
          >
            Start Fetching 🚀
          </Button>
        ) : (
          <Button
            onClick={next}
            className="h-16 bg-primary text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/30"
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}
