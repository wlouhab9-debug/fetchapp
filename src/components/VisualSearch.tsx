import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, Loader2, Check, X, ArrowRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";

export default function VisualSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ name: string; confidence: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const handleImageSource = async (source: 'camera' | 'gallery') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (source === 'camera') {
      input.capture = 'environment';
    }

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        analyzeImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    setResult(null);
    const apiKey = import.meta.env.VITE_GOOGLE_VISION_KEY;

    try {
      // Clean base64 string
      const content = base64Image.split(',')[1];
      
      const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
        method: 'POST',
        body: JSON.stringify({
          requests: [{
            image: { content },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 5 },
              { type: 'WEB_DETECTION', maxResults: 5 }
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error.message);

      // Simple heuristic for product name extraction
      const webEntities = data.responses[0]?.webDetection?.webEntities || [];
      const labels = data.responses[0]?.labelAnnotations || [];
      
      const bestMatch = webEntities[0]?.description || labels[0]?.description || "Unknown Product";
      const confidence = Math.round((webEntities[0]?.score || labels[0]?.score || 0.5) * 100);

      setResult({ name: bestMatch, confidence });
      setEditName(bestMatch);
    } catch (error) {
      console.error("Vision API Error:", error);
      toast({
        title: "Analysis Failed",
        description: "Couldn't identify this product. Try scanning the barcode or searching by name.",
        variant: "destructive"
      });
      setImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (result || editName) {
      setLocation(`/search?q=${encodeURIComponent(editName || result?.name || "")}`);
      onClose();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 my-4" />
        
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div 
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 flex flex-col gap-4"
            >
              <DrawerHeader className="px-0">
                <DrawerTitle className="text-2xl font-bold">Visual Search</DrawerTitle>
                <p className="text-zinc-500">Take a photo of a product to find it instantly</p>
              </DrawerHeader>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => handleImageSource('camera')}
                  className="h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white gap-3 text-lg font-bold"
                >
                  <Camera className="h-6 w-6" />
                  Take Photo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleImageSource('gallery')}
                  className="h-16 rounded-2xl border-zinc-200 gap-3 text-lg font-bold"
                >
                  <ImageIcon className="h-6 w-6" />
                  Choose from Gallery
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="analyze"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 flex flex-col gap-6"
            >
              <div className="relative aspect-square w-full max-w-sm mx-auto rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-100">
                <img src={image} className="w-full h-full object-cover" alt="Preview" />
                
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="font-bold text-lg animate-pulse">Analyzing image...</p>
                  </div>
                )}
              </div>

              {!isAnalyzing && result && (
                <div className="flex flex-col gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="text-sm font-bold text-primary uppercase tracking-wider">Detected Product</span>
                    </div>
                    
                    {isEditing ? (
                      <div className="flex flex-col gap-3 mt-4">
                        <Input 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-center h-12 text-lg font-bold rounded-xl focus:ring-primary/20"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-primary text-white font-bold h-12 rounded-xl"
                            onClick={handleConfirm}
                          >
                            Search
                          </Button>
                          <Button 
                            variant="ghost"
                            className="h-12 rounded-xl"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold text-zinc-900 leading-tight">{result.name}</h2>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                            {result.confidence}% Match
                          </Badge>
                          <span className="text-zinc-400 text-sm">Is this right?</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 mt-8">
                          <Button 
                            className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg gap-2"
                            onClick={handleConfirm}
                          >
                            Yes, Find Near Me
                            <ArrowRight className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost"
                            className="h-12 rounded-2xl text-zinc-500 font-bold"
                            onClick={() => setIsEditing(true)}
                          >
                            No, Edit Name
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setImage(null); setResult(null); setIsEditing(false); }}
                className="absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-sm"
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-8" />
      </DrawerContent>
    </Drawer>
  );
}

function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: any }) {
  return (
    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${className}`}>
      {children}
    </div>
  );
}
