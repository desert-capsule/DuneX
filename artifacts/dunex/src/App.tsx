import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PublicLayout } from "@/components/PublicLayout";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Lazy-loaded pages (each becomes its own chunk)
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Capsules = lazy(() => import("@/pages/Capsules"));
const CapsuleDetails = lazy(() => import("@/pages/CapsuleDetails"));
const Activities = lazy(() => import("@/pages/Activities"));
const Booking = lazy(() => import("@/pages/Booking"));
const Partners = lazy(() => import("@/pages/Partners"));
const Contact = lazy(() => import("@/pages/Contact"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#040404] flex items-center justify-center font-mono">
      <div className="text-primary text-xs tracking-widest animate-pulse">LOADING...</div>
    </div>
  );
}

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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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
