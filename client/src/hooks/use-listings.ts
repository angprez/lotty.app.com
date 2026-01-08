import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertListing } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Helper to filter undefined values from objects before creating query strings
function cleanParams(params: any) {
  const newParams: any = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== "") {
      newParams[key] = params[key].toString();
    }
  });
  return newParams;
}

export function useListings(filters?: z.infer<typeof api.listings.list.input>) {
  const queryKey = [api.listings.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = cleanParams(filters || {});
      const url = filters ? `${api.listings.list.path}?${new URLSearchParams(params)}` : api.listings.list.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch listings");
      return api.listings.list.responses[200].parse(await res.json());
    },
  });
}

export function useListing(id: number) {
  return useQuery({
    queryKey: [api.listings.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.listings.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch listing");
      return api.listings.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: InsertListing) => {
      // Ensure numeric fields are numbers
      const payload = {
        ...data,
        price: Number(data.price),
        landSize: Number(data.landSize),
        lat: data.lat ? Number(data.lat) : undefined,
        lng: data.lng ? Number(data.lng) : undefined,
        downPayment: data.downPayment ? Number(data.downPayment) : undefined,
      };

      const res = await fetch(api.listings.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error("No tienes una suscripción activa para publicar.");
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear la publicación");
      }
      return api.listings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
      toast({ title: "Publicación creada", description: "Tu terreno está pendiente de aprobación." });
      setLocation("/mi-cuenta");
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertListing>) => {
       const url = buildUrl(api.listings.update.path, { id });
       const res = await fetch(url, {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data),
         credentials: "include",
       });
       if (!res.ok) throw new Error("Failed to update listing");
       return api.listings.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.listings.get.path, data.id] });
      toast({ title: "Actualizado", description: "La publicación ha sido modificada." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });
}

export function useUploadImage() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ listingId, file }: { listingId: number, file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const url = buildUrl(api.listings.uploadImage.path, { id: listingId });
      const res = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to upload image");
      return api.listings.uploadImage.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Imagen subida", description: "La imagen se agregó correctamente." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo subir la imagen." });
    }
  });
}
