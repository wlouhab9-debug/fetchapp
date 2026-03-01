import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useListItems(listId: number) {
  return useQuery({
    queryKey: [api.listItems.list.path, listId],
    queryFn: async () => {
      const url = buildUrl(api.listItems.list.path, { listId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch list items");
      return api.listItems.list.responses[200].parse(await res.json());
    },
    enabled: !!listId,
  });
}

export function useCreateListItem(listId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; checked?: boolean }) => {
      const validated = api.listItems.create.input.parse(data);
      const url = buildUrl(api.listItems.create.path, { listId });
      const res = await fetch(url, {
        method: api.listItems.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create item");
      return api.listItems.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.listItems.list.path, listId] });
    },
  });
}

export function useUpdateListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, checked, listId }: { id: number; checked: boolean; listId: number }) => {
      const validated = api.listItems.update.input.parse({ checked });
      const url = buildUrl(api.listItems.update.path, { id });
      const res = await fetch(url, {
        method: api.listItems.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update item");
      return api.listItems.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.listItems.list.path, variables.listId] });
    },
  });
}
