import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Navigation, ShoppingBag, Loader2, List, Map as MapIcon, Clock, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DeliverySheet from "@/components/DeliverySheet";

export default function StoreResults() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const productId = searchParams.get("productId") || "";
  const productName = searchParams.get("productName") || "Product";

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'distance' | 'price'>('distance');
  const [deliveryStore, setDeliveryStore] = useState<any>(null);

  const { data: stores, isLoading } = useQuery({
    queryKey: [api.stores.search.path, coords?.lat, coords?.lng],
    enabled: !!coords,
    queryFn: async () => {
      const url = buildUrl(api.stores.search.path) + `?lat=${coords!.lat}&lng=${coords!.lng}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch stores");
      return res.json();
    }
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setPermissionStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPermissionStatus('granted');
      },
      () => setPermissionStatus('denied')
    );
  };

  const sortedStores = stores ? [...stores].sort((a, b) => {
    if (sortBy === 'price') {
      return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
    }
    return (a.distance || 0) - (b.distance || 0);
  }) : [];

  if (permissionStatus === 'prompt' || permissionStatus === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center gap-6">
        <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center">
          <MapPin className="h-12 w-12 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Find stores near you</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Fetch needs your location to find nearby stores carrying {productName}.</p>
        </div>
        <Button
          onClick={requestLocation}
          data-testid="button-allow-location"
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
        >
          Allow Access
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation(-1 as any)}
              data-testid="button-back"
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-lg truncate max-w-[200px] text-zinc-900 dark:text-zinc-100">{productName}</h1>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-500'}`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-500'}`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Map
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('distance')}
            className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${sortBy === 'distance' ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
          >
            Closest
          </button>
          <button
            onClick={() => setSortBy('price')}
            className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${sortBy === 'price' ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
          >
            Cheapest
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Finding nearby stores...</p>
        </div>
      ) : (
        <>
          <div className={`w-full ${viewMode === 'map' ? 'h-[70vh]' : 'h-[40vh]'} relative bg-zinc-200 dark:bg-zinc-800 overflow-hidden`}>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps/embed/v1/search?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || 'GOOGLE_API_KEY'}&q=grocery+store&center=${coords?.lat},${coords?.lng}&zoom=14`}
              allowFullScreen
            />
          </div>

          <div className="p-4 flex flex-col gap-4 -mt-4 relative z-10">
            {sortedStores.map((store, idx) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <StoreCard
                  store={store}
                  onOpenDelivery={() => setDeliveryStore(store)}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

      <DeliverySheet
        isOpen={!!deliveryStore}
        onClose={() => setDeliveryStore(null)}
        productName={productName}
        price={deliveryStore?.price || "$0.00"}
      />
    </div>
  );
}

function StoreCard({ store, onOpenDelivery }: { store: any; onOpenDelivery: () => void }) {
  const getStockColor = (stock: string) => {
    switch (stock) {
      case 'in_stock': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'limited': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-red-50 text-red-700 border-red-100';
    }
  };

  const getStockLabel = (stock: string) => {
    switch (stock) {
      case 'in_stock': return 'In Stock';
      case 'limited': return 'Limited';
      default: return 'Out of Stock';
    }
  };

  return (
    <Card className="border-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 shadow-lg overflow-hidden" data-testid={`card-store-${store.id}`}>
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{store.name}</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {store.distance} miles</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {store.travelTime}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-primary">{store.price}</p>
            <Badge className={`mt-1 text-[10px] ${getStockColor(store.stock)}`}>
              {getStockLabel(store.stock)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-10 font-bold border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 gap-2"
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.location.lat},${store.location.lng}`)}
            data-testid={`button-directions-${store.id}`}
          >
            <Navigation className="h-4 w-4" /> Directions
          </Button>
          <Button
            className="rounded-xl h-10 font-bold bg-primary hover:bg-primary/90 text-white"
            onClick={onOpenDelivery}
            data-testid={`button-order-${store.id}`}
          >
            Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
