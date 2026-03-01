import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type Tab = "signin" | "signup";

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: "", color: "", width: "0%" };
  if (password.length < 6) return { label: "Weak", color: "bg-red-500", width: "33%" };
  if (password.length < 10 || !/[0-9]/.test(password) || !/[A-Z]/.test(password))
    return { label: "Medium", color: "bg-amber-400", width: "66%" };
  return { label: "Strong", color: "bg-emerald-500", width: "100%" };
}

export default function Auth() {
  const [tab, setTab] = useState<Tab>("signin");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [signInForm, setSignInForm] = useState({ email: "", password: "" });
  const [signUpForm, setSignUpForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const strength = getPasswordStrength(signUpForm.password);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signInForm.email,
      password: signInForm.password,
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      setLocation("/profile");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpForm.password !== signUpForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signUpForm.email,
      password: signUpForm.password,
      options: { data: { full_name: signUpForm.name } },
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created! Check your email to confirm." });
      setLocation("/");
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-back"
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 px-6 flex flex-col gap-8">
        <div className="text-center pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-4">
            <span className="text-white font-black text-2xl italic">f</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">Welcome to Fetch</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Find any product near you</p>
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
          {(["signin", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`button-tab-${t}`}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                tab === t ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "signin" ? (
            <motion.form
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSignIn}
              className="flex flex-col gap-4"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={signInForm.email}
                  onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                  className="pl-11 h-14 bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl font-medium"
                  data-testid="input-email-signin"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={signInForm.password}
                  onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                  className="pl-11 pr-11 h-14 bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl font-medium"
                  data-testid="input-password-signin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button type="button" className="text-primary text-sm font-bold text-right -mt-2 hover:underline">
                Forgot password?
              </button>
              <Button
                type="submit"
                disabled={loading}
                data-testid="button-submit-signin"
                className="h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
              </Button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogle}
                data-testid="button-google-signin"
                className="h-14 rounded-2xl font-bold text-base border-zinc-200 dark:border-zinc-700 gap-3"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSignUp}
              className="flex flex-col gap-4"
            >
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Full Name"
                  value={signUpForm.name}
                  onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                  className="pl-11 h-14 bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl font-medium"
                  data-testid="input-name-signup"
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                  className="pl-11 h-14 bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl font-medium"
                  data-testid="input-email-signup"
                  required
                />
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    className="pl-11 pr-11 h-14 bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl font-medium"
                    data-testid="input-password-signup"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signUpForm.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${
                      strength.label === "Weak" ? "text-red-500" :
                      strength.label === "Medium" ? "text-amber-500" : "text-emerald-500"
                    }`}>{strength.label}</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={signUpForm.confirm}
                  onChange={(e) => setSignUpForm({ ...signUpForm, confirm: e.target.value })}
                  className="pl-11 h-14 bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl font-medium"
                  data-testid="input-confirm-password-signup"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                data-testid="button-submit-signup"
                className="h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
              </Button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogle}
                data-testid="button-google-signup"
                className="h-14 rounded-2xl font-bold text-base border-zinc-200 dark:border-zinc-700 gap-3"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </Button>
              <p className="text-center text-[11px] text-zinc-400 leading-relaxed px-4">
                By creating an account you agree to our{" "}
                <span className="text-primary font-bold">Terms of Service</span> and{" "}
                <span className="text-primary font-bold">Privacy Policy</span>.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
      <div className="h-12" />
    </div>
  );
}
