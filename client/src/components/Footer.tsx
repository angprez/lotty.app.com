import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-muted border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="font-display text-2xl font-bold text-primary mb-4 block">
              Lotty.py
            </Link>
            <p className="text-sm text-muted-foreground">
              La plataforma líder en compra y venta de terrenos en Paraguay. Encuentra tu lugar ideal hoy.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terrenos" className="hover:text-primary">Buscar Terrenos</Link></li>
              <li><Link href="/precios" className="hover:text-primary">Planes y Precios</Link></li>
              <li><Link href="/login" className="hover:text-primary">Ingresar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-pointer hover:text-primary">Términos y Condiciones</span></li>
              <li><span className="cursor-pointer hover:text-primary">Política de Privacidad</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>soporte@lotty.py</li>
              <li>Asunción, Paraguay</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Lotty. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
