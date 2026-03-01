import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronRight, LogOut, Bell, MapPin, Moon, Sun, Share2, History, Bookmark, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { useLists } from "@/hooks/use-lists";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: lists } = useLists();
  const [radius, setRadius] = useState(10);
  const [defaultDelivery, setDefaultDelivery] = useState("doordash");
  const [notifications, setNotifications] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("prefs") || "{}");
    if (saved.radius) setRadius(saved.radius);
    if (saved.defaultDelivery) setDefaultDelivery(saved.defaultDelivery);
    if (saved.notifications !== undefined) setNotifications(saved.notifications);
    if (saved.location !== undefined) setLocationEnabled(saved.location);
    if (saved.darkMode !== undefined) {
      setDarkMode(saved.darkMode);
      document.documentElement.classList.toggle("dark", saved.darkMode);
    }
  }, []);

  const savePref = (key: string, value: any) => {
    const saved = JSON.parse(localStorage.getItem("prefs") || "{}");
    localStorage.setItem("prefs", JSON.stringify({ ...saved, [key]: value }));
  };

  const toggleDark = (val: boolean) => {
    setDarkMode(val);
    savePref("darkMode", val);
    document.documentElement.classList.toggle("dark", val);
  };

  const handleShare = () => {
    const text = "I use Fetch to find any product at the cheapest nearby store — try it free! https://fetch.app";
    if (navigator.share) navigator.share({ text });
    else {
      navigator.clipboard.writeText(text);
      toast({ title: "Link copied!" });
    }
  };

  const searchHistory = JSON.parse(localStorage.getItem("search_history") || "[]");

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 flex flex-col gap-6 min-h-screen pb-24 bg-zinc-50 dark:bg-zinc-950"
      >
        <div className="pt-6 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👤</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Sign in to Fetch</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Unlock the full Fetch experience</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 flex flex-col gap-4">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Why create an account?</h3>
          <div className="flex flex-col gap-3">
            {[
              "Save your shopping lists",
              "Track your savings over time",
              "Sync across all your devices",
              "Get personalized price alerts",
            ].map((b) => (
              <div key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => setLocation("/auth")}
            data-testid="button-sign-in-profile"
            className="h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20"
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/auth")}
            data-testid="button-create-account-profile"
            className="h-14 rounded-2xl font-bold text-base border-zinc-200 dark:border-zinc-700"
          >
            Create Account
          </Button>
        </div>
      </motion.div>
    );
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "You";
  const initial = name[0].toUpperCase();
  const searchCount = searchHistory.length;
  const savedAmount = (searchCount * 2.43).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24"
    >
      <div className="bg-primary px-6 pt-10 pb-8 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/40">
            <span className="text-2xl font-black text-white">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white truncate">{name}</h1>
            <p className="text-white/70 text-xs font-medium truncate">{user.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/40 text-white bg-transparent hover:bg-white/10 rounded-xl text-xs font-bold"
            data-testid="button-edit-profile"
          >
            <Settings className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-6 -mt-2">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "🔍", label: "Searches", value: searchCount },
            { icon: "💰", label: "Saved", value: `$${savedAmount}` },
            { icon: "📋", label: "Lists", value: lists?.length || 0 },
          ].map((s) => (
            <div
              key={s.label}
              data-testid={`stat-${s.label.toLowerCase()}`}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-3 text-center shadow-sm border border-zinc-100 dark:border-zinc-800"
            >
              <span className="text-2xl">{s.icon}</span>
              <p className="font-black text-zinc-900 dark:text-zinc-100 text-lg mt-1">{s.value}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        <Section title="Preferences">
          <div className="flex flex-col gap-0">
            <div className="p-4 flex flex-col gap-3 border-b border-zinc-50 dark:border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Search Radius</span>
                <span className="text-primary font-black text-sm">{radius} mi</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={radius}
                onChange={(e) => { setRadius(Number(e.target.value)); savePref("radius", Number(e.target.value)); }}
                data-testid="input-radius"
                className="w-full accent-primary h-2 rounded-full"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                <span>1 mi</span><span>25 mi</span>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2 border-b border-zinc-50 dark:border-zinc-800">
              <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Default Delivery</span>
              <div className="flex gap-2">
                {[
                  { id: "doordash", label: "DoorDash", color: "#FF3008" },
                  { id: "ubereats", label: "Uber Eats", color: "#06C167" },
                  { id: "amazon", label: "Amazon", color: "#FF9900" },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setDefaultDelivery(d.id); savePref("defaultDelivery", d.id); }}
                    data-testid={`button-delivery-${d.id}`}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all border ${
                      defaultDelivery === d.id
                        ? "text-white border-transparent shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700"
                    }`}
                    style={defaultDelivery === d.id ? { backgroundColor: d.color } : {}}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <PrefToggle
              label="Notifications"
              icon={<Bell className="h-4 w-4 text-purple-500" />}
              value={notifications}
              onChange={(v) => { setNotifications(v); savePref("notifications", v); }}
            />
            <PrefToggle
              label="Location"
              icon={<MapPin className="h-4 w-4 text-blue-500" />}
              value={locationEnabled}
              onChange={(v) => { setLocationEnabled(v); savePref("location", v); }}
            />
            <PrefToggle
              label="Dark Mode"
              icon={darkMode ? <Moon className="h-4 w-4 text-zinc-400 dark:text-zinc-300" /> : <Sun className="h-4 w-4 text-amber-500" />}
              value={darkMode}
              onChange={toggleDark}
              last
              testId="toggle-dark-mode"
            />
          </div>
        </Section>

        <Section title="Account">
          <div className="flex flex-col">
            <MenuRow icon={<Bookmark className="h-4 w-4 text-primary" />} label="Saved Products" onClick={() => {}} />
            <MenuRow icon={<History className="h-4 w-4 text-zinc-500" />} label="Search History" onClick={() => {}} />
            <MenuRow icon={<Share2 className="h-4 w-4 text-emerald-500" />} label="Share Fetch" onClick={handleShare} last />
          </div>
        </Section>

        <Button
          variant="ghost"
          onClick={async () => { await signOut(); setLocation("/"); }}
          data-testid="button-sign-out"
          className="h-14 rounded-2xl text-red-500 font-bold border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40"
        >
          <LogOut className="h-5 w-5 mr-2" /> Sign Out
        </Button>

        <p className="text-center text-xs font-medium text-zinc-400 pb-4">Fetch v1.0.0</p>
      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">{title}</h3>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">{children}</div>
    </div>
  );
}

function PrefToggle({
  label, icon, value, onChange, last, testId
}: {
  label: string;
  icon: React.ReactNode;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
  testId?: string;
}) {
  return (
    <div className={`p-4 flex items-center justify-between ${!last ? "border-b border-zinc-50 dark:border-zinc-800" : ""}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{label}</span>
      </div>
      <Switch checked={value} onCheckedChange={onChange} data-testid={testId} />
    </div>
  );
}

function MenuRow({ icon, label, onClick, last }: { icon: React.ReactNode; label: string; onClick: () => void; last?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${!last ? "border-b border-zinc-50 dark:border-zinc-800" : ""}`}
    >
      {icon}
      <span className="flex-1 text-left font-bold text-sm text-zinc-800 dark:text-zinc-200">{label}</span>
      <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
    </button>
  );
}
