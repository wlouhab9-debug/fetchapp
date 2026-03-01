import { MapPin, DollarSign, Zap, Search, ScanLine, Loader2, ArrowLeft, ShoppingCart } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DeliverySheet from "@/components/DeliverySheet";

type FilterType = "closest" | "cheapest" | "fastest";

export default function SearchResults() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const query = searchParams.get("q") || "";
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
  const [deliveryProduct, setDeliveryProduct] = useState<any>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/products/search", query],
    enabled: !!query,
    queryFn: async () => {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const products = useMemo(() => {
    if (!data?.products) return [];
    let items = [...data.products];
    if (activeFilter === "cheapest") {
      items.sort((a: any, b: any) => parseFloat(a.price_range.split('$')[1]) - parseFloat(b.price_range.split('$')[1]));
    }
    return items;
  }, [data, activeFilter]);

  if (!query) {
    setLocation("/");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="rounded-full"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 h-10 rounded-full flex items-center px-4 gap-2">
            <Search className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{query}</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <FilterPill
            active={activeFilter === "closest"}
            onClick={() => setActiveFilter(activeFilter === "closest" ? null : "closest")}
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Closest"
          />
          <FilterPill
            active={activeFilter === "cheapest"}
            onClick={() => setActiveFilter(activeFilter === "cheapest" ? null : "cheapest")}
            icon={<DollarSign className="h-3.5 w-3.5" />}
            label="Cheapest"
          />
          <FilterPill
            active={activeFilter === "fastest"}
            onClick={() => setActiveFilter(activeFilter === "fastest" ? null : "fastest")}
            icon={<Zap className="h-3.5 w-3.5" />}
            label="Fastest Delivery"
          />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div key="loading" className="flex flex-col gap-4">
              {[1, 2, 3, 4].map(i => <ProductSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div key="error" className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              Something went wrong. Please try again.
            </div>
          ) : products.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 flex flex-col items-center gap-4"
            >
              <div className="bg-zinc-100 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-zinc-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">No results found</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-[200px] mx-auto mt-1">
                  Try a different search or scan the barcode instead.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-full gap-2 border-primary text-primary hover:bg-primary/5"
                onClick={() => setLocation("/scan")}
              >
                <ScanLine className="h-4 w-4" />
                Scan Barcode
              </Button>
            </motion.div>
          ) : (
            <div key="results" className="flex flex-col gap-4">
              {products.map((product: any, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductCard
                    product={product}
                    onOpenDelivery={() => setDeliveryProduct(product)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <DeliverySheet
        isOpen={!!deliveryProduct}
        onClose={() => setDeliveryProduct(null)}
        productName={deliveryProduct?.product_name || ""}
        price={deliveryProduct?.price_range?.split(' - ')[0] || "$0.00"}
      />
    </div>
  );
}

function FilterPill({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all
        ${active
          ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
          : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 active:scale-95"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ProductCard({ product, onOpenDelivery }: { product: any; onOpenDelivery: () => void }) {
  const [, setLocation] = useLocation();
  return (
    <Card className="overflow-hidden border-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-product-${product.id}`}>
      <CardContent className="p-0 flex h-32">
        <div className="w-32 h-full relative flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/300/300`;
            }}
          />
        </div>
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight truncate flex-1">
                {product.product_name}
              </h3>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] px-1.5 h-4">
                In Stock
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 truncate">{product.brands}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-bold text-primary">{product.price_range}</p>
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDelivery();
                }}
              >
                <div className="flex -space-x-1">
                  <div className="w-3 h-3 rounded-full bg-[#FF3008] border border-white dark:border-zinc-900" />
                  <div className="w-3 h-3 rounded-full bg-[#06C167] border border-white dark:border-zinc-900" />
                  <div className="w-3 h-3 rounded-full bg-[#FF9900] border border-white dark:border-zinc-900" />
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">Delivery</span>
              </div>
            </div>
          </div>
          <Button
            data-testid={`button-find-near-me-${product.id}`}
            className="w-full h-8 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/10"
            onClick={() => setLocation(`/stores?productId=${product.id}&productName=${encodeURIComponent(product.product_name)}`)}
          >
            Find Near Me
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 h-32 flex overflow-hidden animate-pulse">
      <div className="w-32 h-full bg-zinc-100 dark:bg-zinc-800" />
      <div className="flex-1 p-3 flex flex-col gap-2">
        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-50 dark:bg-zinc-700 rounded w-1/2" />
        <div className="mt-auto h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-full" />
      </div>
    </div>
  );
}
