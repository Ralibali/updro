import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterSupplierPage from "./pages/RegisterSupplierPage";
import ProjectWizard from "./pages/ProjectWizard";
import PricingPage from "./pages/PricingPage";
import BrowseAgenciesPage from "./pages/BrowseAgenciesPage";
import AgencyProfilePage from "./pages/AgencyProfilePage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AboutPage from "./pages/AboutPage";
import TermsPage from "./pages/TermsPage";
import CookieConsent from "./components/CookieConsent";
import NotFound from "./pages/NotFound";

// SEO pages
import PillarPage from "./components/seo/PillarPage";
import SubPage from "./components/seo/SubPage";

// Buyer pages
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import BuyerProjects from "./pages/buyer/BuyerProjects";
import ProjectDetail from "./pages/buyer/ProjectDetail";

// Supplier pages
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import BrowseProjects from "./pages/supplier/BrowseProjects";
import ProjectUnlock from "./pages/supplier/ProjectUnlock";
import SupplierOffers from "./pages/supplier/SupplierOffers";
import BillingPage from "./pages/supplier/BillingPage";
import ReferralPage from "./pages/supplier/ReferralPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/publicera" element={<ProjectWizard />} />
            <Route path="/byraer" element={<BrowseAgenciesPage />} />
            <Route path="/byraer/:slug" element={<AgencyProfilePage />} />
            <Route path="/priser" element={<PricingPage />} />
            <Route path="/om-oss" element={<AboutPage />} />
            <Route path="/support" element={<PlaceholderPage title="Support" />} />
            <Route path="/integritetspolicy" element={<PrivacyPolicyPage />} />
            <Route path="/villkor" element={<TermsPage />} />
            <Route path="/logga-in" element={<LoginPage />} />
            <Route path="/registrera" element={<RegisterPage />} />
            <Route path="/registrera/byra" element={<RegisterSupplierPage />} />
            <Route path="/aterstall-losenord" element={<PlaceholderPage title="Återställ lösenord" />} />

            {/* Buyer dashboard */}
            <Route path="/dashboard/buyer" element={<ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/buyer/uppdrag" element={<ProtectedRoute role="buyer"><BuyerProjects /></ProtectedRoute>} />
            <Route path="/dashboard/buyer/uppdrag/:id" element={<ProtectedRoute role="buyer"><ProjectDetail /></ProtectedRoute>} />
            <Route path="/dashboard/buyer/chatt" element={<ProtectedRoute role="buyer"><ChatPage /></ProtectedRoute>} />
            <Route path="/dashboard/buyer/profil" element={<ProtectedRoute role="buyer"><ProfilePage /></ProtectedRoute>} />

            {/* Supplier dashboard */}
            <Route path="/dashboard/supplier" element={<ProtectedRoute role="supplier"><SupplierDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/supplier/uppdrag" element={<ProtectedRoute role="supplier"><BrowseProjects /></ProtectedRoute>} />
            <Route path="/dashboard/supplier/uppdrag/:id" element={<ProtectedRoute role="supplier"><ProjectUnlock /></ProtectedRoute>} />
            <Route path="/dashboard/supplier/offerter" element={<ProtectedRoute role="supplier"><SupplierOffers /></ProtectedRoute>} />
            <Route path="/dashboard/supplier/chatt" element={<ProtectedRoute role="supplier"><ChatPage /></ProtectedRoute>} />
            <Route path="/dashboard/supplier/profil" element={<ProtectedRoute role="supplier"><ProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard/supplier/fakturering" element={<ProtectedRoute role="supplier"><BillingPage /></ProtectedRoute>} />
            <Route path="/dashboard/supplier/bjud-in" element={<ProtectedRoute role="supplier"><ReferralPage /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/anvandare" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/anvandare/:id" element={<ProtectedRoute role="admin"><AdminUserDetail /></ProtectedRoute>} />
            <Route path="/admin/byraer" element={<ProtectedRoute role="admin"><AdminSuppliers /></ProtectedRoute>} />
            <Route path="/admin/uppdrag" element={<ProtectedRoute role="admin"><AdminProjects /></ProtectedRoute>} />
            <Route path="/admin/offerter" element={<ProtectedRoute role="admin"><AdminOffers /></ProtectedRoute>} />
            <Route path="/admin/notifikationer" element={<ProtectedRoute role="admin"><AdminNotifications /></ProtectedRoute>} />
            <Route path="/admin/installningar" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />

            {/* SEO pillar + sub pages */}
            <Route path="/:category" element={<PillarPage />} />
            <Route path="/:category/:sub" element={<SubPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
