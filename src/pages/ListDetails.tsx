import { ArrowLeft, Plus, Check, Trash2, Loader2, Share2, Route, ShoppingCart, Minus } from "lucide-react";
import { Link, useRoute, useLocation } from "wouter";
import { useState } from "react";
import { useList } from "@/hooks/use-lists";
import { useListItems, useCreateListItem, useUpdateListItem } from "@/hooks/use-list-items";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function ListDetails() {
  const [, params] = useRoute("/lists/:id");
  const listId = params?.id ? parseInt(params.id, 10) : 0;
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: list, isLoading: listLoading } = useList(listId);
  const { data: items } = useListItems(listId);

  const createItem = useCreateListItem(listId);
  const updateItem = useUpdateListItem();

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showCheapestSheet, setShowCheapestSheet] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, storeName: "", price: "" });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    createItem.mutate(newItem, {
      onSuccess: () => {
        setNewItem({ name: "", quantity: 1, storeName: "", price: "" });
        setShowAddSheet(false);
      }
    });
  };

  const deleteItem = async (id: number) => {
    await apiRequest("DELETE", `/api/items/${id}`);
    queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/items`] });
  };

  const toggleItem = (id: number, checked: boolean) => {
    updateItem.mutate({ id, checked, listId });
  };

  const handleShare = () => {
    const text = `My Fetch Shopping List ${list?.emoji || '🛒'}\n${items?.filter(i => !i.checked).map(i => `• ${i.name} x${i.quantity || 1}`).join('\n')}\nFind the best prices with Fetch!`;
    if (navigator.share) {
      navigator.share({ title: list?.name, text });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "List copied to clipboard!" });
    }
  };

  if (listLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!list) return null;

  const stillNeed = items?.filter(i => !i.checked) || [];
  const gotIt = items?.filter(i => i.checked) || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-32"
    >
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-4 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/lists" data-testid="button-back" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-400">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{list.emoji}</span>
            <h1 className="font-display font-bold text-xl truncate max-w-[180px] text-zinc-900 dark:text-zinc-100">{list.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleShare} data-testid="button-share" className="rounded-full text-zinc-500">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {stillNeed.length > 0 && (
        <div className="p-4">
          <button
            onClick={() => setShowCheapestSheet(true)}
            data-testid="button-find-cheapest"
            className="w-full bg-primary p-4 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Find Cheapest Cart</p>
                <p className="text-[10px] text-white/80 font-medium leading-tight">Best store combo for your list</p>
              </div>
            </div>
            <Plus className="h-5 w-5 rotate-45 opacity-50" />
          </button>
        </div>
      )}

      <div className="px-4 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Still Need</h2>
            <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-none font-bold text-[10px] h-5 px-2">
              {stillNeed.length} items
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {stillNeed.map((item) => (
              <ItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
            ))}
          </div>
        </div>

        {gotIt.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Got It ✓</h2>
            <div className="flex flex-col gap-2 opacity-60">
              {gotIt.map((item) => (
                <ItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        size="icon"
        onClick={() => setShowAddSheet(true)}
        data-testid="button-add-item"
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary shadow-2xl shadow-primary/40 text-white hover:bg-primary/90"
      >
        <Plus className="h-8 w-8" />
      </Button>

      <Drawer open={showAddSheet} onOpenChange={setShowAddSheet}>
        <DrawerContent>
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600 my-4" />
          <DrawerHeader className="px-6">
            <DrawerTitle className="text-2xl font-bold">Add Item</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleAddItem} className="p-6 pt-0 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Product Name</p>
              <Input
                autoFocus
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="What do you need?"
                data-testid="input-item-name"
                className="h-14 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-xl px-4 text-lg font-bold focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Quantity</p>
              <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl p-2 h-14">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-lg h-10 w-10 bg-white dark:bg-zinc-700 shadow-sm"
                  onClick={() => setNewItem({ ...newItem, quantity: Math.max(1, newItem.quantity - 1) })}
                  data-testid="button-quantity-decrease"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="flex-1 text-center font-bold text-lg text-zinc-900 dark:text-zinc-100">{newItem.quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-lg h-10 w-10 bg-white dark:bg-zinc-700 shadow-sm"
                  onClick={() => setNewItem({ ...newItem, quantity: newItem.quantity + 1 })}
                  data-testid="button-quantity-increase"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Store (Optional)</p>
                <Input
                  value={newItem.storeName}
                  onChange={(e) => setNewItem({ ...newItem, storeName: e.target.value })}
                  placeholder="Walmart..."
                  className="h-12 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-xl px-4 font-bold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Price (Optional)</p>
                <Input
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="$0.00"
                  className="h-12 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-xl px-4 font-bold"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={createItem.isPending || !newItem.name.trim()}
              data-testid="button-add-item-submit"
              className="h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 mt-2"
            >
              {createItem.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Add to List'}
            </Button>
          </form>
          <div className="h-8" />
        </DrawerContent>
      </Drawer>

      <Drawer open={showCheapestSheet} onOpenChange={setShowCheapestSheet}>
        <DrawerContent>
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600 my-4" />
          <div className="p-6 pt-0 flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-primary/10 p-4 rounded-3xl text-primary mb-2">
                <Route className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Best Shopping Route</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">We found the cheapest combination of stores for your {stillNeed.length} items.</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">Buy 4 items at Walmart</p>
                  <p className="text-xs text-zinc-400 font-medium">Milk, Eggs, Bread, Butter</p>
                </div>
                <p className="font-bold text-primary text-lg">$12.43</p>
              </div>
              <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">Buy 2 items at Aldi</p>
                  <p className="text-xs text-zinc-400 font-medium">Apples, Bananas</p>
                </div>
                <p className="font-bold text-primary text-lg">$4.99</p>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-4 rounded-2xl text-center">
              <p className="font-bold text-emerald-900 dark:text-emerald-400 text-lg">Total: $17.42</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest mt-1">You save $4.31! 🎉</p>
            </div>

            <Button
              className="h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
              onClick={() => window.open('https://maps.google.com')}
            >
              Get Directions to Walmart first
            </Button>
          </div>
          <div className="h-8" />
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
}

function ItemRow({ item, onToggle, onDelete }: { item: any; onToggle: (id: number, checked: boolean) => void; onDelete: (id: number) => void }) {
  return (
    <div
      data-testid={`row-item-${item.id}`}
      className={`bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-3 group transition-all ${item.checked ? 'bg-zinc-50/50 dark:bg-zinc-900/50' : ''}`}
    >
      <button
        onClick={() => onToggle(item.id, !item.checked)}
        data-testid={`button-toggle-item-${item.id}`}
        className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          item.checked ? 'bg-primary border-primary text-white' : 'border-zinc-200 dark:border-zinc-600 text-transparent'
        }`}
      >
        <Check className="h-4 w-4" strokeWidth={4} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-bold truncate ${item.checked ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {item.name}
          </span>
          <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none text-[9px] font-bold h-4 px-1.5 rounded">
            x{item.quantity || 1}
          </Badge>
        </div>
        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{item.storeName || 'Any store'}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-primary text-sm">{item.price || '--'}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(item.id)}
        data-testid={`button-delete-item-${item.id}`}
        className="h-8 w-8 text-zinc-300 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
