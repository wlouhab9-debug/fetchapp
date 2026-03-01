import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateListRequest } from "@shared/schema";

export function useLists() {
  return useQuery({
    queryKey: [api.lists.list.path],
    queryFn: async () => {
      const res = await fetch(api.lists.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch lists");
      return api.lists.list.responses[200].parse(await res.json());
    },
  });
}

export function useList(id: number) {
  return useQuery({
    queryKey: [api.lists.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.lists.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch list");
      return api.lists.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateListRequest) => {
      const validated = api.lists.create.input.parse(data);
      const res = await fetch(api.lists.create.path, {
        method: api.lists.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create list");
      return api.lists.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lists.list.path] });
    },
  });
}
