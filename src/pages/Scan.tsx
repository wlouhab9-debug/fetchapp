import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { BrowserMultiFormatReader, Result } from "@zxing/library";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Camera, Search, ArrowLeft, Loader2, Flashlight, History, ShoppingBag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api, buildUrl } from "@shared/routes";
import { formatDistanceToNow } from "date-fns";

interface ScannedProduct {
  id: string;
  name: string;
  image: string;
  timestamp: number;
}

export default function ScanPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [recentScans, setRecentScans] = useState<ScannedProduct[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    const saved = localStorage.getItem("recent_scans");
    if (saved) {
      setRecentScans(JSON.parse(saved));
    }
  }, []);

  const saveScan = (product: any) => {
    const newScan: ScannedProduct = {
      id: product.id,
      name: product.product_name || "Unknown Product",
      image: product.image_url,
      timestamp: Date.now(),
    };
    
    const updated = [newScan, ...recentScans.filter(s => s.id !== product.id)].slice(0, 3);
    setRecentScans(updated);
    localStorage.setItem("recent_scans", JSON.stringify(updated));
  };

  const playBeep = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  };

  const handleBarcodeDetected = useCallback(async (result: Result) => {
    if (isScanning) return;
    setIsScanning(true);
    playBeep();
    
    const barcode = result.getText();
    
    try {
      const url = buildUrl(api.products.getByBarcode.path, { barcode });
      const res = await fetch(url);
      
      if (!res.ok) {
        toast({
          title: "Product not found",
          description: "Try searching by name instead.",
          variant: "destructive",
        });
        setIsScanning(false);
        return;
      }

      const product = await res.json();
      saveScan(product);
      
      setLocation(`/stores?productId=${product.id}&productName=${encodeURIComponent(product.product_name)}`);
    } catch (error) {
      toast({
        title: "Scan failed",
        description: "Could not fetch product details.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  }, [isScanning, setLocation, toast, recentScans]);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result) {
            handleBarcodeDetected(result);
          }
        });
      }
    } catch (err) {
      setHasPermission(false);
      toast({
        title: "Camera Access Required",
        description: "Please enable camera permissions to scan barcodes.",
        variant: "destructive",
      });
    }
  };

  const toggleFlash = async () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashOn } as any]
        });
        setIsFlashOn(!isFlashOn);
      } catch (e) {
        toast({
          title: "Flash not supported",
          description: "Your device camera might not support flashlight.",
        });
      }
    }
  };

  if (hasPermission === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center gap-6">
        <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center text-primary">
          <ScanLine className="h-12 w-12" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-zinc-900">Scan Any Product</h1>
          <p className="text-zinc-500">Point your camera at any barcode to instantly find it at stores near you</p>
        </div>
        <div className="w-full flex flex-col gap-4">
          <Button 
            onClick={startScanner}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
          >
            Enable Camera
          </Button>
          <Link href="/" className="text-zinc-400 text-sm font-medium hover:text-zinc-600">
            Search manually instead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Top Controls */}
      <div className="absolute top-0 inset-x-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/")}
          className="rounded-full text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleFlash}
          className={`rounded-full text-white hover:bg-white/20 ${isFlashOn ? 'bg-primary/20' : ''}`}
        >
          <Flashlight className={`h-6 w-6 ${isFlashOn ? 'fill-primary text-primary' : ''}`} />
        </Button>
      </div>

      {/* Scanner View */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay 
          playsInline 
          muted
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
          {/* Frame Brackets */}
          <div className="relative w-72 h-48 border-2 border-white/20 rounded-2xl">
            {/* Corner Brackets */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-xl" />
            
            {/* Scanning Line */}
            <motion.div 
              animate={{ top: ["5%", "95%", "5%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-2 right-2 h-0.5 bg-primary shadow-[0_0_15px_rgba(234,88,12,0.8)] z-10"
            />
          </div>
          
          <p className="mt-8 text-white font-medium bg-black/40 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm">
            Align barcode within the frame
          </p>
        </div>

        {isScanning && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center z-50 backdrop-blur-[2px]">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Manual Link */}
      <div className="bg-black py-4 flex flex-col items-center">
        <Link href="/" className="text-zinc-400 text-sm font-medium hover:text-zinc-600 mb-4">
          Search manually instead
        </Link>
      </div>

      {/* Recent Scans */}
      <div className="bg-white rounded-t-3xl p-6 min-h-[250px]">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-zinc-400" />
          <h2 className="font-bold text-zinc-900">Recently Scanned</h2>
        </div>

        <div className="flex flex-col gap-3">
          {recentScans.length > 0 ? (
            recentScans.map((scan) => (
              <button
                key={scan.id + scan.timestamp}
                onClick={() => setLocation(`/stores?productId=${scan.id}&productName=${encodeURIComponent(scan.name)}`)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-zinc-100 overflow-hidden flex-shrink-0">
                  <img src={scan.image} alt={scan.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-zinc-900 text-sm truncate">{scan.name}</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" /> {formatDistanceToNow(scan.timestamp)} ago
                  </p>
                </div>
                <ArrowLeft className="h-4 w-4 text-zinc-300 rotate-180" />
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-400 gap-2">
              <ShoppingBag className="h-8 w-8 opacity-20" />
              <p className="text-sm">No recently scanned items</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
