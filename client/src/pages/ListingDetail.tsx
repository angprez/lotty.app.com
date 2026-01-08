import { useListing } from "@/hooks/use-listings";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Ruler, DollarSign, User, Phone, Mail, Share2, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateChat } from "@/hooks/use-chats";
import { useToast } from "@/hooks/use-toast";

export default function ListingDetail() {
  const [match, params] = useRoute("/terreno/:id");
  const id = parseInt(params?.id || "0");
  const { data: listing, isLoading } = useListing(id);
  const { user } = useAuth();
  const createChat = useCreateChat();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!listing) return <div className="p-20 text-center">Terreno no encontrado</div>;

  if (listing.status === 'archived' && user?.id !== listing.userId && user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-2">Este anuncio no está disponible</h1>
        <p className="text-muted-foreground mb-8">El terreno ha sido archivado o ya no se encuentra a la venta.</p>
        <Link href="/terrenos">
          <Button variant="default">Ver otros terrenos</Button>
        </Link>
      </div>
    );
  }

  const handleContact = () => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes ingresar para contactar al vendedor." });
      return;
    }
    createChat.mutate({ listingId: listing.id });
  };

  const mainImage = listing.images && listing.images.length > 0
    ? listing.images[0].url
    : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Image Gallery Hero */}
      <div className="relative h-[400px] md:h-[500px] w-full bg-muted">
        <img 
          src={mainImage} 
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-md">
                  {listing.status === 'active' ? 'En Venta' : listing.status}
                </Badge>
                {listing.featured && <Badge className="bg-secondary text-secondary-foreground">Destacado</Badge>}
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 drop-shadow-md">
                {listing.title}
              </h1>
              <div className="flex items-center text-white/90 gap-4 text-lg">
                <span className="flex items-center"><MapPin className="mr-1 h-5 w-5" /> {listing.city}, {listing.department}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl md:text-4xl font-bold text-secondary drop-shadow-sm">
                {listing.currency === 'USD' ? 'USD' : 'Gs.'} {Number(listing.price).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold border-b pb-4">Detalles de la Propiedad</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Superficie Total</p>
                  <p className="font-semibold flex items-center">
                    <Ruler className="mr-2 h-4 w-4 text-primary" /> {listing.landSize} m²
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dimensiones</p>
                  <p className="font-semibold">{listing.dimensions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tipo de Título</p>
                  <p className="font-semibold">{listing.titleStatus === 'has_title' ? 'Titulado' : 'Derecho de Ocupación'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Condición Pago</p>
                  <p className="font-semibold capitalize">{listing.paymentCondition.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3 text-lg">Descripción</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {listing.googleMapsLink && (
                 <div>
                    <h3 className="font-bold mb-3 text-lg">Ubicación</h3>
                    <a 
                      href={listing.googleMapsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      <MapPin className="mr-2 h-4 w-4" /> Ver en Google Maps
                    </a>
                 </div>
              )}
            </div>
          </div>

          {/* Right Column: Contact */}
          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-lg sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {listing.ownerName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Publicado por</p>
                  <h3 className="font-bold text-lg">{listing.ownerName}</h3>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                  onClick={handleContact}
                >
                  <MessageCircle className="mr-2 h-5 w-5" /> Contactar Vendedor
                </Button>
                
                <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5 text-primary">
                  <Phone className="mr-2 h-4 w-4" /> Mostrar Teléfono
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t text-center">
                 <p className="text-xs text-muted-foreground mb-2">Comparte esta propiedad</p>
                 <div className="flex justify-center gap-2">
                   <Button size="icon" variant="ghost" className="rounded-full"><Share2 className="h-4 w-4" /></Button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
