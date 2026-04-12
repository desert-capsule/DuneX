import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PublicLayout } from "@/components/PublicLayout";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Capsules from "@/pages/Capsules";
import CapsuleDetails from "@/pages/CapsuleDetails";
import Activities from "@/pages/Activities";
import Booking from "@/pages/Booking";
import Partners from "@/pages/Partners";
import Contact from "@/pages/Contact";
import Dashboard from "@/pages/Dashboard";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route>
        <PublicLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/capsules" component={Capsules} />
            <Route path="/capsules/:id" component={CapsuleDetails} />
            <Route path="/activities" component={Activities} />
            <Route path="/booking" component={Booking} />
            <Route path="/partners" component={Partners} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
