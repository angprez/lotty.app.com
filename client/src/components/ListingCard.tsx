import { Link } from "wouter";
import { type Listing, type ListingImage } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Ruler, DollarSign } from "lucide-react";

interface ListingCardProps {
  listing: Listing & { images: ListingImage[] };
}

export function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.images && listing.images.length > 0 
    ? listing.images[0].url 
    : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"; // Default landscape

  return (
    <Link href={`/terreno/${listing.id}`}>
      <div className="group cursor-pointer h-full">
        <Card className="h-full overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
          <div className="aspect-[4/3] relative overflow-hidden bg-muted">
            <img 
              src={mainImage} 
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-2 left-2 flex gap-2">
              {listing.featured && (
                <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold border-none shadow-sm">
                  Destacado
                </Badge>
              )}
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-foreground font-medium shadow-sm">
                {listing.status === 'active' ? 'En Venta' : listing.status}
              </Badge>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
              <p className="text-white font-bold text-lg drop-shadow-md">
                {listing.currency === 'USD' ? 'USD' : 'Gs.'} {Number(listing.price).toLocaleString()}
              </p>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mb-1">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span className="truncate">{listing.city}, {listing.department}</span>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Ruler className="h-3.5 w-3.5 mr-1" />
              <span>{listing.landSize} m²</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
