import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PublicLayout } from "@/components/PublicLayout";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import Login from "@/pages/Login";

const queryClient = new QueryClient();

function ProtectedDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040404] flex items-center justify-center font-mono">
        <div className="text-primary text-xs tracking-widest animate-pulse">AUTHENTICATING...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Dashboard />;
}

function Router() {
  return (
    <Switch>
      <Route path="/dashboard" component={ProtectedDashboard} />
      <Route path="/login" component={Login} />
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
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
