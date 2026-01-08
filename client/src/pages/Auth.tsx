import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { insertUserSchema } from "@shared/schema";

// Login Schema
const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export function Login() {
  const { login } = useAuth();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    login.mutate(data);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block bg-[url('https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=1200')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        <div className="relative z-10 h-full flex items-center justify-center p-12 text-white">
          <div className="max-w-md">
            <h1 className="text-4xl font-display font-bold mb-4 text-white">
              Bienvenido a Lotty
            </h1>
            <p className="text-lg text-white/90">
              Ingresa a la comunidad inmobiliaria más grande de Paraguay.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-muted-foreground">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario / Email</FormLabel>
                    <FormControl>
                      <Input placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-lg"
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            ¿No tienes cuenta?{" "}
            <Link
              href="/registro"
              className="text-primary hover:underline font-semibold"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Register
export function Register() {
  const { register } = useAuth();
  const form = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      phone: "",
      role: "user",
    },
  });

  const onSubmit = (data: z.infer<typeof insertUserSchema>) => {
    register.mutate(data);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-background order-2 md:order-1">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-2">
              Crear Cuenta
            </h2>
            <p className="text-muted-foreground">
              Únete hoy y empieza a publicar
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="0981..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-lg"
                disabled={register.isPending}
              >
                {register.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-semibold"
            >
              Inicia Sesión
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-[url('https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=1200')] bg-cover bg-center relative order-1 md:order-2">
        <div className="absolute inset-0 bg-secondary/40 mix-blend-multiply" />
        <div className="relative z-10 h-full flex items-center justify-center p-12 text-white">
          <div className="max-w-md text-right">
            <h1 className="text-4xl font-display font-bold mb-4 text-white">
              Encuentra tu lugar
            </h1>
            <p className="text-lg opacity-90">
              Miles de terrenos te esperan en nuestra plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
