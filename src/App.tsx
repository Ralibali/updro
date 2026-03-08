import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterSupplierPage from "./pages/RegisterSupplierPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/publicera" element={<PlaceholderPage title="Publicera uppdrag" description="Beskriv ditt uppdrag och ta emot offerter gratis." />} />
            <Route path="/byraer" element={<PlaceholderPage title="Hitta byråer" description="Sök bland kvalificerade byråer i Sverige." />} />
            <Route path="/priser" element={<PlaceholderPage title="Priser" description="Transparent prissättning – 40% billigare." />} />
            <Route path="/om-oss" element={<PlaceholderPage title="Om Updro" />} />
            <Route path="/support" element={<PlaceholderPage title="Support" />} />
            <Route path="/integritetspolicy" element={<PlaceholderPage title="Integritetspolicy" />} />
            <Route path="/villkor" element={<PlaceholderPage title="Villkor" />} />
            <Route path="/logga-in" element={<LoginPage />} />
            <Route path="/registrera" element={<RegisterPage />} />
            <Route path="/registrera/byra" element={<RegisterSupplierPage />} />
            <Route path="/aterstall-losenord" element={<PlaceholderPage title="Återställ lösenord" />} />
            <Route path="/dashboard/buyer" element={<PlaceholderPage title="Beställar-dashboard" />} />
            <Route path="/dashboard/supplier" element={<PlaceholderPage title="Byrå-dashboard" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
