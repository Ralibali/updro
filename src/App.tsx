import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/publicera" element={<PlaceholderPage title="Publicera uppdrag" description="Beskriv ditt uppdrag och ta emot offerter gratis." />} />
          <Route path="/byraer" element={<PlaceholderPage title="Hitta byråer" description="Sök bland kvalificerade byråer i Sverige." />} />
          <Route path="/priser" element={<PlaceholderPage title="Priser" description="Transparent prissättning – 40% billigare." />} />
          <Route path="/om-oss" element={<PlaceholderPage title="Om Updro" />} />
          <Route path="/support" element={<PlaceholderPage title="Support" />} />
          <Route path="/integritetspolicy" element={<PlaceholderPage title="Integritetspolicy" />} />
          <Route path="/villkor" element={<PlaceholderPage title="Villkor" />} />
          <Route path="/logga-in" element={<PlaceholderPage title="Logga in" />} />
          <Route path="/registrera" element={<PlaceholderPage title="Registrera" />} />
          <Route path="/registrera/byra" element={<PlaceholderPage title="Registrera din byrå" description="Starta med 5 gratis leads – inget kreditkort krävs." />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
