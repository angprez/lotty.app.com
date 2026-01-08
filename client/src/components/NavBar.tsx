import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, LogOut, User, LayoutDashboard, PlusCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function NavBar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isAuthPage = location === "/login" || location === "/registro";
  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display text-2xl font-bold text-primary flex items-center gap-2">
           Lotty.py
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/terrenos" className="text-sm font-medium hover:text-primary transition-colors">
            Explorar Terrenos
          </Link>
          <Link href="/precios" className="text-sm font-medium hover:text-primary transition-colors">
            Planes
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/mi-cuenta/publicar">
                <Button size="sm" className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
                  <PlusCircle className="h-4 w-4" />
                  Publicar
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.fullName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/mi-cuenta" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Mi Cuenta
                    </Link>
                  </DropdownMenuItem>
                   {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => logout.mutate()} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Iniciar Sesión</Button>
              </Link>
              <Link href="/registro">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/terrenos" className="text-lg font-medium">
                  Explorar Terrenos
                </Link>
                <Link href="/precios" className="text-lg font-medium">
                  Planes
                </Link>
                {user ? (
                  <>
                    <Link href="/mi-cuenta" className="text-lg font-medium">
                      Mi Cuenta
                    </Link>
                    <Link href="/mi-cuenta/publicar" className="text-lg font-medium text-primary">
                      Publicar Terreno
                    </Link>
                    <Button 
                      variant="destructive" 
                      className="mt-4"
                      onClick={() => logout.mutate()}
                    >
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button className="w-full" variant="outline">Iniciar Sesión</Button>
                    </Link>
                    <Link href="/registro">
                      <Button className="w-full">Registrarse</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
