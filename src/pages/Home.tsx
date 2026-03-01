import { Search, ScanLine, Camera, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRecentSearches, useCreateSearch } from "@/hooks/use-searches";
import { motion } from "framer-motion";
import VisualSearch from "@/components/VisualSearch";

export default function Home() {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const { data: recentSearches, isLoading } = useRecentSearches();
  const createSearch = useCreateSearch();
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    createSearch.mutate({ userId: 1, query: query.trim() });
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 flex flex-col gap-8"
    >
      <div className="flex flex-col gap-6 pt-4">
        <h1 className="font-display text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight tracking-tight">
          What are you looking for today?
        </h1>

        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl text-base font-medium shadow-sm
                     text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all"
            placeholder="Search products, stores..."
            data-testid="input-search"
          />
          <button
            type="submit"
            data-testid="button-search-submit"
            className="absolute inset-y-2 right-2 bg-primary text-white rounded-xl px-4 font-semibold shadow-md shadow-primary/20
                     hover:bg-primary/90 active:scale-95 transition-all"
          >
            Find
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/scan"
          data-testid="link-scan"
          className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm flex flex-col gap-3 active:scale-95 transition-all group hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
        >
          <div className="bg-zinc-50 dark:bg-zinc-700 w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <ScanLine className="h-5 w-5 text-zinc-700 dark:text-zinc-300 group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Scan Barcode</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Find exact items</p>
          </div>
        </Link>

        <button
          onClick={() => setIsVisualSearchOpen(true)}
          data-testid="button-visual-search"
          className="text-left bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm flex flex-col gap-3 active:scale-95 transition-all group hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
        >
          <div className="bg-zinc-50 dark:bg-zinc-700 w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Camera className="h-5 w-5 text-zinc-700 dark:text-zinc-300 group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Take a Photo</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Visual search</p>
          </div>
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">Recent Searches</h2>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentSearches && recentSearches.length > 0 ? (
            <div className="flex flex-col">
              {recentSearches.slice(0, 5).map((search, i) => (
                <button
                  key={search.id}
                  data-testid={`button-recent-search-${search.id}`}
                  onClick={() => setQuery(search.query)}
                  className={`flex items-center justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 active:bg-zinc-100 dark:active:bg-zinc-600 transition-colors
                    ${i !== (recentSearches.slice(0, 5).length - 1) ? 'border-b border-zinc-50 dark:border-zinc-700' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{search.query}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
              No recent searches yet
            </div>
          )}
        </div>
      </div>

      <VisualSearch isOpen={isVisualSearchOpen} onClose={() => setIsVisualSearchOpen(false)} />
    </motion.div>
  );
}
