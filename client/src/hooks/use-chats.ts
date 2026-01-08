import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useChats() {
  return useQuery({
    queryKey: [api.chats.list.path],
    queryFn: async () => {
      const res = await fetch(api.chats.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chats");
      return api.chats.list.responses[200].parse(await res.json());
    },
  });
}

export function useChatMessages(chatId: number) {
  return useQuery({
    queryKey: [api.chats.getMessages.path, chatId],
    queryFn: async () => {
      const url = buildUrl(api.chats.getMessages.path, { id: chatId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.chats.getMessages.responses[200].parse(await res.json());
    },
    enabled: !!chatId,
    refetchInterval: 5000, // Poll every 5s for new messages
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ listingId }: { listingId: number }) => {
      const res = await fetch(api.chats.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to start chat");
      return api.chats.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chats.list.path] });
      toast({ title: "Chat iniciado", description: "Puedes conversar con el vendedor ahora." });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ chatId, content }: { chatId: number, content: string }) => {
      const url = buildUrl(api.chats.sendMessage.path, { id: chatId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.chats.sendMessage.responses[201].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.chats.getMessages.path, variables.chatId] });
      queryClient.invalidateQueries({ queryKey: [api.chats.list.path] }); // Update last message preview
    },
  });
}
