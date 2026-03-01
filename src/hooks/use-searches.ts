import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type CreateSearchRequest } from "@shared/schema";

export function useRecentSearches() {
  return useQuery({
    queryKey: [api.searches.list.path],
    queryFn: async () => {
      const res = await fetch(api.searches.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recent searches");
      return api.searches.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSearchRequest) => {
      const validated = api.searches.create.input.parse(data);
      const res = await fetch(api.searches.create.path, {
        method: api.searches.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log search");
      return api.searches.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.searches.list.path] });
    },
  });
}
