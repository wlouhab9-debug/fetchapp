import React, { Suspense, lazy, useEffect, useState, Component } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";

const MobileLayout = lazy(() => import("./components/layout/MobileLayout"));
const Home = lazy(() => import("./pages/Home"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const StoreResults = lazy(() => import("./pages/StoreResults"));
const ScanPage = lazy(() => import("./pages/Scan"));
const Lists = lazy(() => import("./pages/Lists"));
const ListDetails = lazy(() => import("./pages/ListDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/not-found"));

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App error caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
          <div className="text-5xl">😕</div>
          <h2 className="text-xl font-bold text-zinc-800">Something went wrong.</h2>
          <p className="text-sm text-zinc-500 max-w-xs">Tap to reload Fetch.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white font-bold rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            Reload Fetch
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const [location] = useLocation();
  const [onboardingDone, setOnboardingDone] = useState(
    () => !!localStorage.getItem("onboarding_done")
  );

  const handleOnboardingFinish = () => {
    localStorage.setItem("onboarding_done", "1");
    setOnboardingDone(true);
  };

  if (!onboardingDone && location === "/") {
    return (
      <Suspense fallback={<PageLoader />}>
        <Onboarding onFinish={handleOnboardingFinish} />
      </Suspense>
    );
  }

  if (location === "/auth" || location === "/onboarding") {
    return (
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/auth" component={Auth} />
          <Route path="/onboarding" component={Onboarding} />
        </Switch>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <MobileLayout>
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/search" component={SearchResults} />
              <Route path="/stores" component={StoreResults} />
              <Route path="/scan" component={ScanPage} />
              <Route path="/lists" component={Lists} />
              <Route path="/lists/:id" component={ListDetails} />
              <Route path="/profile" component={Profile} />
              <Route component={NotFound} />
            </Switch>
          </motion.div>
        </AnimatePresence>
      </MobileLayout>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AnimatedRoutes />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
