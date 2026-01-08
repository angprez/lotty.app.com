import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.admin.stats.responses[200].parse(await res.json());
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: [api.admin.users.path],
    queryFn: async () => {
      const res = await fetch(api.admin.users.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.admin.users.responses[200].parse(await res.json());
    },
  });
}

export function useModerateListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, action, reason }: { id: number, action: 'approve' | 'reject', reason?: string }) => {
      const url = buildUrl(api.admin.moderateListing.path, { id });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Moderation failed");
      return api.admin.moderateListing.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
      toast({ title: "Moderación exitosa", description: "El estado de la publicación ha sido actualizado." });
    },
  });
}

export function useAssignPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, planType, durationDays, maxListings }: { userId: number, planType: string, durationDays: number, maxListings: number }) => {
      const url = buildUrl(api.admin.assignPlan.path, { id: userId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType, durationDays, maxListings }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to assign plan");
      return api.admin.assignPlan.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.path] });
      toast({ title: "Plan asignado", description: "El usuario ahora tiene un nuevo plan activo." });
    },
  });
}
