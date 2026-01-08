import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, Checkbox, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const plans = [
  {
    name: "Prueba Gratis",
    price: "Gs. 0",
    duration: "30 días",
    listings: "Ilimitado",
    description: "Probá todas las funciones sin costo por un mes.",
    features: ["Publicaciones ilimitadas", "Soporte básico", "Visible por 30 días"],
    buttonText: "Activar Prueba",
    type: "free_trial"
  },
  {
    name: "Mensual",
    price: "Gs. 40.000",
    duration: "30 días",
    listings: "Ilimitado",
    description: "Ideal para vendedores ocasionales.",
    features: ["Publicaciones ilimitadas", "Soporte prioritario", "Vigencia mensual"],
    buttonText: "Elegir Mensual",
    type: "monthly",
    recommended: true
  },
  {
    name: "Anual",
    price: "Gs. 350.000",
    duration: "365 días",
    listings: "Ilimitado",
    description: "La mejor opción para inmobiliarias y profesionales.",
    features: ["Publicaciones ilimitadas", "Soporte VIP", "Vigencia anual", "Ahorro del 25%"],
    buttonText: "Elegir Anual",
    type: "annual"
  }
];

export default function Planes() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleSelectPlan = (planType: string) => {
    if (!user) {
      setLocation("/login?redirect=/planes");
      return;
    }
    // In this simplified version, we just redirect to contact support or dashboard
    // since payments are not integrated.
    window.open(`https://wa.me/595981000000?text=Hola, quiero activar el plan ${planType} en Lotty`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">Planes Simples para Vos</h1>
        <p className="text-xl text-muted-foreground">
          Sin límites de publicaciones. Elegí el plan que mejor se adapte a tus necesidades.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.type} className={`relative flex flex-col ${plan.recommended ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
            {plan.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                Recomendado
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">/ {plan.duration}</span>
              </div>
              <p className="text-muted-foreground mt-4">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full text-lg py-6" 
                variant={plan.recommended ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan.type)}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-20 bg-muted/30 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">¿Necesitás algo a medida?</h2>
        <p className="text-muted-foreground mb-6">Contamos con planes corporativos para grandes desarrolladoras.</p>
        <Button variant="link" className="text-primary font-bold">
          Contactar con Ventas <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
