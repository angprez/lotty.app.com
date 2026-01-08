import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Listings from "@/pages/Listings";
import ListingDetail from "@/pages/ListingDetail";
import Planes from "@/pages/Planes";
import { Login, Register } from "@/pages/Auth";
import DashboardLayout from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/terrenos" component={Listings} />
          <Route path="/terreno/:id" component={ListingDetail} />
          <Route path="/planes" component={Planes} />
          <Route path="/precios" component={Planes} />
          
          <Route path="/login" component={Login} />
          <Route path="/registro" component={Register} />
          
          {/* Protected Routes nested in DashboardLayout */}
          <Route path="/dashboard*" component={DashboardLayout} />
          <Route path="/mi-cuenta*" component={DashboardLayout} />
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
