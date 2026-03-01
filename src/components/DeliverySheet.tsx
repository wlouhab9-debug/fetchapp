import { X, ShoppingCart, Clock, Calendar, Star, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface DeliveryOption {
  id: string;
  name: string;
  color: string;
  time: string;
  fee: string;
  buttonText: string;
  deepLink: string;
  fallback: string;
  badge?: string;
}

interface DeliverySheetProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  price: string;
}

export default function DeliverySheet({ isOpen, onClose, productName, price }: DeliverySheetProps) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [mostUsed, setMostUsed] = useState<string>("doordash");

  useEffect(() => {
    const stats = JSON.parse(localStorage.getItem("delivery_clicks") || "{}");
    const top = Object.entries(stats).sort((a: any, b: any) => b[1] - a[1])[0];
    if (top) setMostUsed(top[0]);
  }, [isOpen]);

  const trackClick = (id: string) => {
    const stats = JSON.parse(localStorage.getItem("delivery_clicks") || "{}");
    stats[id] = (stats[id] || 0) + 1;
    localStorage.setItem("delivery_clicks", JSON.stringify(stats));
  };

  const options: DeliveryOption[] = [
    {
      id: "doordash",
      name: "DoorDash",
      color: "#FF3008",
      time: "20-35 min",
      fee: "~$3.99 delivery fee",
      buttonText: "Order on DoorDash",
      deepLink: "doordash://",
      fallback: `https://doordash.com/search/${encodeURIComponent(productName)}`,
    },
    {
      id: "ubereats",
      name: "Uber Eats",
      color: "#06C167",
      time: "25-40 min",
      fee: "$0 with Uber One",
      buttonText: "Order on Uber Eats",
      deepLink: "ubereats://",
      fallback: `https://ubereats.com/search?q=${encodeURIComponent(productName)}`,
    },
    {
      id: "amazon",
      name: "Amazon Fresh",
      color: "#FF9900",
      time: "Scheduled",
      fee: "Prime: FREE 2-hour delivery",
      buttonText: "Order on Amazon Fresh",
      deepLink: "",
      fallback: `https://amazon.com/s?k=${encodeURIComponent(productName)}&i=amazonfresh`,
      badge: "Prime: FREE 2-hour delivery"
    }
  ];

  const deliveryPrice = (parseFloat(price.replace(/[^0-9.]/g, '')) + 3.5).toFixed(2);

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[95vh]">
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 my-4" />
        
        <DrawerHeader className="px-6 flex items-center justify-between">
          <DrawerTitle className="text-xl font-bold">Get it delivered fast</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-6 pb-8 overflow-y-auto no-scrollbar flex flex-col gap-6">
          {/* Price Comparison */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
            <p className="text-lg font-bold text-zinc-900">
              🏪 In-store: {price}  <span className="text-zinc-400 mx-2">vs</span>  🚗 Delivery: ${deliveryPrice}
            </p>
            <p className="text-xs text-primary font-bold mt-1 uppercase tracking-wider">
              Delivery costs $3.50 more
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-4">
            {options.map((opt) => (
              <div key={opt.id} className="relative">
                {mostUsed === opt.id && (
                  <div className="absolute -top-2 left-4 z-10">
                    <Badge className="bg-amber-400 text-amber-950 border-none font-bold text-[10px] px-2 py-0">
                      <Star className="h-3 w-3 fill-amber-950 mr-1" /> MOST USED
                    </Badge>
                  </div>
                )}
                <Card className="border-zinc-100 shadow-sm overflow-hidden">
                  <div className="p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black italic text-sm"
                          style={{ backgroundColor: opt.color }}
                        >
                          {opt.name[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900">{opt.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {opt.time}</span>
                            <span>•</span>
                            <span>{opt.fee}</span>
                          </div>
                        </div>
                      </div>
                      {opt.badge && (
                        <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700 bg-amber-50">
                          {opt.badge}
                        </Badge>
                      )}
                    </div>
                    <Button 
                      className="w-full h-11 font-bold rounded-xl text-white gap-2"
                      style={{ backgroundColor: opt.color }}
                      onClick={() => {
                        trackClick(opt.id);
                        window.open(opt.fallback, '_blank');
                      }}
                    >
                      {opt.buttonText}
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Schedule Section */}
          <div className="border border-zinc-100 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full p-4 flex items-center justify-between bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Calendar className="h-5 w-5 text-zinc-400" />
                Schedule for later
              </div>
              {showSchedule ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
            </button>
            <AnimatePresence>
              {showSchedule && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-white"
                >
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Time Slot</p>
                      <select className="w-full h-10 rounded-xl border-zinc-100 text-sm font-medium focus:ring-primary/20 bg-white">
                        <option>Morning (8am-12pm)</option>
                        <option>Afternoon (12pm-4pm)</option>
                        <option>Evening (4pm-8pm)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Day</p>
                      <select className="w-full h-10 rounded-xl border-zinc-100 text-sm font-medium focus:ring-primary/20 bg-white">
                        <option>Tomorrow</option>
                        <option>Day After</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Card({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <div className={`bg-white rounded-2xl border ${className}`} style={style}>
      {children}
    </div>
  );
}
