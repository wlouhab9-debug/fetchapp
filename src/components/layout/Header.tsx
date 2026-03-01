import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "wouter";

function getUncheckedCount(): number {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith("fetch_list_") || key === "fetch_lists") {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: { checked?: boolean }) => {
            if (!item.checked) total += 1;
          });
        }
      }
    }
    return total;
  } catch {
    return 0;
  }
}

export default function Header() {
  const [, navigate] = useLocation();
  const [itemCount, setItemCount] = useState(getUncheckedCount);

  const refresh = useCallback(() => {
    setItemCount(getUncheckedCount());
  }, []);

  useEffect(() => {
    window.addEventListener("storage", refresh);
    window.addEventListener("fetch_lists_updated", refresh);

    const interval = setInterval(refresh, 3000);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("fetch_lists_updated", refresh);
      clearInterval(interval);
    };
  }, [refresh]);

  const badgeLabel = itemCount >= 9 ? "9+" : String(itemCount);
  const showBadge = itemCount > 0;

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-zinc-100 px-4 py-3 flex items-center justify-between transition-all">
      <Link href="/" className="flex items-center gap-1.5 active:scale-95 transition-transform">
        <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
          <ShoppingBag size={20} strokeWidth={2.5} />
        </div>
        <span className="font-display font-bold text-2xl text-primary tracking-tight leading-none pt-1">
          fetch
        </span>
      </Link>

      <button
        data-testid="button-cart"
        onClick={() => navigate("/lists")}
        className="relative p-1.5 active:scale-90 transition-transform"
        aria-label="Shopping lists"
      >
        <ShoppingCart size={26} strokeWidth={2} color="#ea580c" />
        {showBadge && (
          <span
            data-testid="badge-cart-count"
            style={{
              width: 18,
              height: 18,
              fontSize: 10,
              backgroundColor: "#ea580c",
            }}
            className="absolute -top-0.5 -right-0.5 rounded-full text-white font-bold flex items-center justify-center leading-none"
          >
            {badgeLabel}
          </span>
        )}
      </button>
    </header>
  );
}
