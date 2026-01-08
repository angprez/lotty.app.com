import { useAuth } from "@/hooks/use-auth";
import { useListings } from "@/hooks/use-listings";
import { useChats } from "@/hooks/use-chats";
import { Link, Route, Switch, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, LayoutDashboard, List, MessageSquare, Settings, LogOut, Loader2 } from "lucide-react";
import CreateListing from "./CreateListing";

function Sidebar() {
  const { logout } = useAuth();
  const [isActive] = useRoute("/mi-cuenta*");

  const links = [
    { href: "/mi-cuenta", icon: LayoutDashboard, label: "Resumen" },
    { href: "/mi-cuenta/publicaciones", icon: List, label: "Mis Publicaciones" },
    { href: "/mi-cuenta/mensajes", icon: MessageSquare, label: "Mensajes" },
  ];

  return (
    <div className="w-64 border-r bg-card hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
      <div className="p-6">
        <h2 className="text-lg font-bold font-display">Mi Cuenta</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
             <Button 
                variant="ghost" 
                className="w-full justify-start"
             >
                <link.icon className="mr-3 h-5 w-5" />
                {link.label}
             </Button>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive/90" onClick={() => logout.mutate()}>
          <LogOut className="mr-3 h-5 w-5" /> Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}

function Overview() {
  const { user } = useAuth();
  
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Hola, {user?.fullName}</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan Actual</CardTitle>
            <Badge variant="secondary">Activo</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.subscription?.planType.replace('_', ' ') || 'Ninguno'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.subscription?.endDate ? `Vence el: ${new Date(user.subscription.endDate).toLocaleDateString()}` : 'Sin plan activo'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Publicaciones</CardTitle>
             <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">Ilimitadas</div>
             <p className="text-xs text-muted-foreground mt-1">Tu plan actual no tiene límites</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center bg-primary/10 p-6 rounded-xl border border-primary/20">
        <div>
          <h3 className="text-lg font-bold text-primary">Gestioná tu Plan</h3>
          <p className="text-sm text-muted-foreground">Renová o cambiá tu suscripción para mantener tus terrenos visibles.</p>
        </div>
        <Link href="/planes">
          <Button>Ver Planes</Button>
        </Link>
      </div>
    </div>
  );
}

function MyListings() {
  const { user } = useAuth();
  const { data: listings, isLoading } = useListings({ userId: user?.id ? String(user.id) : undefined });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Mis Publicaciones</h1>
        <Link href="/mi-cuenta/publicar">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" /> Nueva Publicación
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin h-8 w-8 mx-auto" />
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Título</th>
                <th className="px-6 py-4 font-medium">Precio</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listings?.map((listing) => (
                <tr key={listing.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{listing.title}</td>
                  <td className="px-6 py-4">{listing.currency} {Number(listing.price).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                      {listing.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm">Editar</Button>
                  </td>
                </tr>
              ))}
              {listings?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No tienes publicaciones aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1">
        <Switch>
          <Route path="/mi-cuenta" component={Overview} />
          <Route path="/mi-cuenta/publicaciones" component={MyListings} />
          <Route path="/mi-cuenta/publicar" component={CreateListing} />
          {/* Add messages route later */}
        </Switch>
      </div>
    </div>
  );
}
