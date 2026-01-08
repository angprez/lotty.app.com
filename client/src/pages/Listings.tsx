import { useListings } from "@/hooks/use-listings";
import { ListingCard } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Filter, X, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

export default function Listings() {
  const [filters, setFilters] = useState({
    search: "",
    department: "all",
    city: "",
    zone: "",
    minPrice: "",
    maxPrice: "",
    currency: "all",
    minSize: "",
    maxSize: "",
    ownerType: "all",
    ownerName: "",
    titleStatus: "all",
    paymentCondition: "all",
    sortBy: "newest"
  });

  const { data: listings, isLoading } = useListings({
    status: "active",
    ...Object.fromEntries(
      Object.entries(filters).map(([k, v]) => [k, v === "all" ? undefined : v || undefined])
    )
  });

  const resetFilters = () => setFilters({
    search: "",
    department: "all",
    city: "",
    zone: "",
    minPrice: "",
    maxPrice: "",
    currency: "all",
    minSize: "",
    maxSize: "",
    ownerType: "all",
    ownerName: "",
    titleStatus: "all",
    paymentCondition: "all",
    sortBy: "newest"
  });

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-bold">Ubicación</Label>
        <Select value={filters.department} onValueChange={(v) => setFilters(f => ({...f, department: v}))}>
          <SelectTrigger><SelectValue placeholder="Departamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el país</SelectItem>
            <SelectItem value="Central">Central</SelectItem>
            <SelectItem value="Alto Paraná">Alto Paraná</SelectItem>
            <SelectItem value="Itapúa">Itapúa</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Ciudad" value={filters.city} onChange={e => setFilters(f => ({...f, city: e.target.value}))} />
        <Input placeholder="Barrio / Zona" value={filters.zone} onChange={e => setFilters(f => ({...f, zone: e.target.value}))} />
      </div>

      <div className="space-y-4">
        <Label className="text-base font-bold">Precio y Moneda</Label>
        <Select value={filters.currency} onValueChange={(v) => setFilters(f => ({...f, currency: v}))}>
          <SelectTrigger><SelectValue placeholder="Moneda" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier moneda</SelectItem>
            <SelectItem value="PYG">Gs. (PYG)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Min" value={filters.minPrice} onChange={e => setFilters(f => ({...f, minPrice: e.target.value}))} />
          <Input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => setFilters(f => ({...f, maxPrice: e.target.value}))} />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-bold">Superficie (m²)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Min m²" value={filters.minSize} onChange={e => setFilters(f => ({...f, minSize: e.target.value}))} />
          <Input type="number" placeholder="Max m²" value={filters.maxSize} onChange={e => setFilters(f => ({...f, maxSize: e.target.value}))} />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-bold">Dueño y Título</Label>
        <Select value={filters.ownerType} onValueChange={(v) => setFilters(f => ({...f, ownerType: v}))}>
          <SelectTrigger><SelectValue placeholder="Tipo de Vendedor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="owner">Dueño</SelectItem>
            <SelectItem value="commission_agent">Comisionista</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.titleStatus} onValueChange={(v) => setFilters(f => ({...f, titleStatus: v}))}>
          <SelectTrigger><SelectValue placeholder="Estado del Título" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="has_title">Con Título</SelectItem>
            <SelectItem value="no_title">Sin Título</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-bold">Condiciones de Pago</Label>
        <Select value={filters.paymentCondition} onValueChange={(v) => setFilters(f => ({...f, paymentCondition: v}))}>
          <SelectTrigger><SelectValue placeholder="Forma de pago" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="cash_only">Contado</SelectItem>
            <SelectItem value="installments">Cuotas</SelectItem>
            <SelectItem value="barter">Trueque / Parte de pago</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={resetFilters}>
        <X className="mr-2 h-4 w-4" /> Limpiar Filtros
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Explorar Terrenos</h1>
          <p className="text-muted-foreground">{listings?.length || 0} resultados encontrados</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={filters.sortBy} onValueChange={(v) => setFilters(f => ({...f, sortBy: v}))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más nuevos</SelectItem>
              <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="az">Nombre: A-Z</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="mr-2 h-4 w-4" /> Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
              <div className="mt-6"><FilterContent /></div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
            <FilterContent />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-10 h-12" 
              placeholder="Buscar por título o descripción..." 
              value={filters.search}
              onChange={e => setFilters(f => ({...f, search: e.target.value}))}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-56 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : listings?.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
              <h3 className="text-xl font-semibold mb-2">No se encontraron terrenos</h3>
              <p className="text-muted-foreground">Probá ajustando los filtros o realizando otra búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings?.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
