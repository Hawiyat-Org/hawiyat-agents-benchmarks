import { QueryClient, useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { client } from "./api-client.js";

const queryClient = new QueryClient();

export function useBenchmarks() {
  return useQuery({
    queryKey: ["benchmarks"],
    queryFn: async () => {
      const res = await client.api.v1.benchmarks.$get();
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function usePosts() {
  return useQuery({
    queryKey: ["posts", { status: "published" }],
    queryFn: async () => {
      const res = await client.api.v1.posts.$get({ query: { page: "1", limit: "10" } });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

export function useCreateBenchmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; score: number }) => {
      const res = await client.api.v1.benchmarks.$post({ json: data });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benchmarks"], exact: true });
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content?: string; status: string; authorId: string }) => {
      const res = await client.api.v1.posts.$post({ json: data });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onMutate: async (newPost) => {
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        return { posts: [...old.posts, { ...newPost, id: "temp", createdAt: new Date().toISOString() }] };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"], exact: true });
    },
  });
}

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["infinite-posts"],
    queryFn: async ({ pageParam }) => {
      const res = await client.api.v1.posts.$get({ query: { page: String(pageParam), limit: "10" } });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await client.api.v1.dashboard.$get();
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}
