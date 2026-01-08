import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema } from "@shared/schema";
import { useCreateListing } from "@/hooks/use-listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CreateListing() {
  const createListing = useCreateListing();
  const form = useForm({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      title: "",
      description: "",
      currency: "PYG",
      price: "",
      department: "",
      city: "",
      zone: "",
      googleMapsLink: "",
      landSize: "",
      dimensions: "",
      ownerName: "",
      ownerType: "owner",
      titleStatus: "has_title",
      phone: "",
      paymentCondition: "cash_only",
    }
  });

  const onSubmit = (data: any) => {
    createListing.mutate(data);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-display">Publicar Terreno</h1>
        <p className="text-muted-foreground">Completa los datos para publicar tu propiedad.</p>
      </div>

      <Alert className="mb-8 bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Importante</AlertTitle>
        <AlertDescription className="text-blue-700">
          Tu publicación será verificada antes de mostrarse públicamente.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle>Información Principal</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Anuncio</FormLabel>
                    <FormControl><Input placeholder="Ej: Terreno en esquina Barrio San José" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl><Textarea placeholder="Detalles sobre el terreno..." className="h-32" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="PYG">Guaraníes (PYG)</SelectItem>
                          <SelectItem value="USD">Dólares (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                      <FormDescription>Min. 7 dígitos para PYG, 4 para USD.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ubicación y Detalles</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Central">Central</SelectItem>
                          <SelectItem value="Alto Paraná">Alto Paraná</SelectItem>
                          <SelectItem value="Cordillera">Cordillera</SelectItem>
                          <SelectItem value="Itapúa">Itapúa</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl><Input placeholder="Ej: Luque" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barrio / Zona</FormLabel>
                    <FormControl><Input placeholder="Ej: Mora Cué" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="googleMapsLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link de Google Maps</FormLabel>
                    <FormControl><Input placeholder="https://maps.google.com/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="landSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Superficie (m²)</FormLabel>
                    <FormControl><Input type="number" placeholder="360" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensiones</FormLabel>
                    <FormControl><Input placeholder="Ej: 12x30" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
             <CardHeader><CardTitle>Información del Vendedor</CardTitle></CardHeader>
             <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Dueño/Vendedor</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Vendedor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="owner">Dueño</SelectItem>
                        <SelectItem value="commission_agent">Comisionista</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titleStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado del Título</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="has_title">Con Título</SelectItem>
                        <SelectItem value="no_title">Sin Título</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono / WhatsApp</FormLabel>
                    <FormControl><Input placeholder="0981..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condición de Pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="cash_only">Contado</SelectItem>
                        <SelectItem value="installments">Cuotas</SelectItem>
                        <SelectItem value="barter">Trueque / Parte de pago</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
             </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
             <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
             <Button type="submit" disabled={createListing.isPending} className="bg-primary hover:bg-primary/90">
               {createListing.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Publicar Terreno
             </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
