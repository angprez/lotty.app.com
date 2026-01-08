import { useListings } from "@/hooks/use-listings";
import { ListingCard } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Listings() {
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    minPrice: "",
    maxPrice: "",
  });

  const { data: listings, isLoading } = useListings({
    status: "active",
    search: filters.search || undefined,
    department: filters.department === "all" ? undefined : filters.department || undefined,
  });

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Ubicación</h3>
        <div className="space-y-3">
          <Input 
            placeholder="Ciudad o Zona" 
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          <Select 
            value={filters.department} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, department: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el país</SelectItem>
              <SelectItem value="Central">Central</SelectItem>
              <SelectItem value="Alto Paraná">Alto Paraná</SelectItem>
              <SelectItem value="Itapúa">Itapúa</SelectItem>
              <SelectItem value="Cordillera">Cordillera</SelectItem>
              <SelectItem value="Guairá">Guairá</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Rango de Precio</h3>
        {/* Simplified for demo - would ideally use a dual range slider */}
        <div className="grid grid-cols-2 gap-2">
          <Input 
            type="number" 
            placeholder="Min" 
            value={filters.minPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
          />
          <Input 
            type="number" 
            placeholder="Max" 
            value={filters.maxPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
          />
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setFilters({ search: "", department: "", minPrice: "", maxPrice: "" })}
      >
        <X className="mr-2 h-4 w-4" /> Limpiar Filtros
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold">Explorar Terrenos</h1>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filters */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <FilterContent />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-56 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : listings?.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
              <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
              <p className="text-muted-foreground">Intenta ajustar tus filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings?.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
