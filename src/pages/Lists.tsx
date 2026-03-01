import { Plus, ChevronRight, Loader2, ShoppingBag, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useLists, useCreateList } from "@/hooks/use-lists";
import { motion } from "framer-motion";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth-context";

const EMOJIS = ["🛒", "🥗", "🧴", "🍕", "🏠", "💊", "🐾", "🎂", "🥩", "🧹", "🍷", "🌿"];

export default function Lists() {
  const { user } = useAuth();
  const { data: lists, isLoading } = useLists();
  const createList = useCreateList();
  const [, setLocation] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🛒");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createList.mutate(
      { name: newListName.trim(), userId: 1, emoji: selectedEmoji },
      {
        onSuccess: (newList) => {
          setNewListName("");
          setShowCreate(false);
          setLocation(`/lists/${newList.id}`);
        }
      }
    );
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 flex flex-col gap-6 min-h-screen pb-24 bg-zinc-50 dark:bg-zinc-950 items-center justify-center"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-8 flex flex-col items-center gap-5 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Sign in to save your lists</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">Create and manage shopping lists that sync across all your devices.</p>
          </div>
          <Button
            onClick={() => setLocation("/auth")}
            data-testid="button-sign-in-lists"
            className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            Sign In
          </Button>
          <button
            onClick={() => setLocation("/auth")}
            className="text-zinc-400 text-sm font-medium hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Create an account →
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-24"
    >
      <div className="flex items-center justify-between mb-6 pt-4">
        <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">My Lists</h1>
        <Button
          size="icon"
          onClick={() => setShowCreate(true)}
          data-testid="button-create-list"
          className="bg-primary hover:bg-primary/90 text-white rounded-full h-10 w-10 shadow-lg shadow-primary/20"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : lists && lists.length > 0 ? (
          <div className="flex flex-col gap-4">
            {lists.map((list: any) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                data-testid={`card-list-${list.id}`}
                className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center gap-4 active:scale-[0.98] transition-all hover:border-primary/30"
              >
                <div className="h-14 w-14 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center flex-shrink-0 text-2xl shadow-inner border border-orange-100/50">
                  {list.emoji || "🛒"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-lg leading-tight">{list.name}</h3>
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>List</span>
                      <span>Updated {formatDistanceToNow(new Date(list.updatedAt || list.createdAt))} ago</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-1/3" />
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center px-8">
            <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-black/[0.03] border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-primary/40" />
            </div>
            <h3 className="font-display font-bold text-2xl text-zinc-800 dark:text-zinc-200 mb-2">No lists yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 max-w-[200px]">Create your first Fetch list to start saving money on your cart.</p>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-primary text-white rounded-xl h-14 px-10 font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg"
            >
              Create a List
            </Button>
          </div>
        )}
      </div>

      <Drawer open={showCreate} onOpenChange={setShowCreate}>
        <DrawerContent>
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600 my-4" />
          <DrawerHeader className="px-6">
            <DrawerTitle className="text-2xl font-bold">New List</DrawerTitle>
          </DrawerHeader>

          <div className="p-6 pt-0 flex flex-col gap-6">
            <div className="grid grid-cols-6 gap-3">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`h-12 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-primary/10 ring-2 ring-primary border-primary'
                      : 'bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 grayscale hover:grayscale-0'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">List Name</p>
              <Input
                autoFocus
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Grocery, Weekly Restock, etc."
                data-testid="input-list-name"
                className="h-14 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-xl px-4 text-lg font-bold focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <Button
                onClick={handleCreate}
                disabled={createList.isPending || !newListName.trim()}
                data-testid="button-create-list-submit"
                className="h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
              >
                {createList.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Create List'}
              </Button>
              <button
                onClick={() => setShowCreate(false)}
                className="h-10 text-zinc-400 font-bold text-sm hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="h-8" />
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
}
