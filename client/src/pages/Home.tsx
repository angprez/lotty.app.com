import { useListings } from "@/hooks/use-listings";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: listings, isLoading } = useListings({ status: "active", limit: 6 });
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (department && department !== "all") params.append("department", department);
    setLocation(`/terrenos?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80')] bg-cover bg-center" />
        
        <div className="container relative z-20 px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 drop-shadow-lg">
            Tu pedacito de cielo,<br/>a un click de distancia.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
            La plataforma más confiable para comprar y vender terrenos en todo Paraguay.
          </p>
          
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl max-w-3xl mx-auto border border-white/20 shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Input 
                  placeholder="Ciudad, zona o barrio..." 
                  className="bg-white h-12 border-none shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="bg-white h-12 border-none">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo el país</SelectItem>
                    <SelectItem value="Central">Central</SelectItem>
                    <SelectItem value="Alto Paraná">Alto Paraná</SelectItem>
                    <SelectItem value="Itapúa">Itapúa</SelectItem>
                    <SelectItem value="Cordillera">Cordillera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="lg" type="submit" className="h-12 px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold">
                <Search className="mr-2 h-5 w-5" /> Buscar
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Terrenos Destacados</h2>
              <p className="text-muted-foreground">Las mejores oportunidades seleccionadas para vos.</p>
            </div>
            <Link href="/terrenos">
              <Button variant="outline" className="hidden md:flex">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings?.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/terrenos">
              <Button variant="outline" className="w-full">
                Ver todos los terrenos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">¿Por qué elegir Lotty?</h2>
            <p className="text-muted-foreground">Simplificamos el proceso de compra y venta de tierras con seguridad y transparencia.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verificados</h3>
              <p className="text-muted-foreground">Revisamos la documentación básica para asegurar que los terrenos son reales.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Precios Claros</h3>
              <p className="text-muted-foreground">Sin comisiones ocultas. Contacta directamente con el vendedor.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Ubicación Exacta</h3>
              <p className="text-muted-foreground">Todos nuestros listados incluyen coordenadas GPS precisas para que puedas visitarlos.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
