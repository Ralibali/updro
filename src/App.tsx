import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import CookieConsent from "@/components/CookieConsent";
import { COMPARISON_PAGES } from "./lib/seoComparisons";
import SupplierLayout from "@/components/SupplierLayout";
import BuyerLayout from "@/components/BuyerLayout";


// Eager: Index (landing page) for fastest FCP
import Index from "./pages/Index";

// Lazy-loaded pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const RegisterSupplierPage = lazy(() => import("./pages/RegisterSupplierPage"));
const ProjectWizard = lazy(() => import("./pages/ProjectWizard"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const BrowseAgenciesPage = lazy(() => import("./pages/BrowseAgenciesPage"));
const AgencyProfilePage = lazy(() => import("./pages/AgencyProfilePage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SupplierLandingPage = lazy(() => import("./pages/SupplierLandingPage"));
const GuidesIndex = lazy(() => import("./pages/GuidesIndex"));
const GuidePage = lazy(() => import("./pages/GuidePage"));

// SEO pages
const PillarPage = lazy(() => import("./components/seo/PillarPage"));
const SubPage = lazy(() => import("./components/seo/SubPage"));
const CityHubPage = lazy(() => import("./components/seo/CityHubPage"));
const CitiesIndex = lazy(() => import("./components/seo/CitiesIndex"));
const ComparisonPage = lazy(() => import("./components/seo/ComparisonPage"));
const ComparisonsIndex = lazy(() => import("./components/seo/ComparisonsIndex"));
const ArticlePage = lazy(() => import("./components/seo/ArticlePage"));
const ArticlesIndex = lazy(() => import("./components/seo/ArticlesIndex"));
const ToolPage = lazy(() => import("./components/seo/ToolPage"));
const ToolsIndex = lazy(() => import("./components/seo/ToolsIndex"));

// Buyer pages
const BuyerDashboard = lazy(() => import("./pages/buyer/BuyerDashboard"));
const BuyerProjects = lazy(() => import("./pages/buyer/BuyerProjects"));
const ProjectDetail = lazy(() => import("./pages/buyer/ProjectDetail"));

// Supplier pages
const SupplierDashboard = lazy(() => import("./pages/supplier/SupplierDashboard"));
const BrowseProjects = lazy(() => import("./pages/supplier/BrowseProjects"));
const ProjectUnlock = lazy(() => import("./pages/supplier/ProjectUnlock"));
const SupplierOffers = lazy(() => import("./pages/supplier/SupplierOffers"));
const BillingPage = lazy(() => import("./pages/supplier/BillingPage"));
const ReferralPage = lazy(() => import("./pages/supplier/ReferralPage"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminUserDetail = lazy(() => import("./pages/admin/AdminUserDetail"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminSuppliers = lazy(() => import("./pages/admin/AdminSuppliers"));
const AdminOffers = lazy(() => import("./pages/admin/AdminOffers"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminGuides = lazy(() => import("./pages/admin/AdminGuides"));
const AdminStripeLog = lazy(() => import("./pages/admin/AdminStripeLog"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminVisitors = lazy(() => import("./pages/admin/AdminVisitors"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/landing/byra" element={<SupplierLandingPage />} />
              <Route path="/guider" element={<GuidesIndex />} />
              <Route path="/guider/:slug" element={<GuidePage />} />

              {/* Content hubs */}
              <Route path="/artiklar" element={<ArticlesIndex />} />
              <Route path="/artiklar/:slug" element={<ArticlePage />} />
              <Route path="/verktyg" element={<ToolsIndex />} />
              <Route path="/verktyg/:slug" element={<ToolPage />} />
              <Route path="/stader" element={<CitiesIndex />} />
              <Route path="/stader/:city" element={<CityHubPage />} />
              <Route path="/jamfor" element={<ComparisonsIndex />} />

              {/* Comparison pages */}
              {COMPARISON_PAGES.map(p => (
                <Route key={p.slug} path={`/${p.slug}`} element={<ComparisonPage />} />
              ))}

              {/* Buyer dashboard */}
              <Route path="/dashboard/buyer" element={<ProtectedRoute role="buyer"><BuyerLayout /></ProtectedRoute>}>
                <Route index element={<BuyerDashboard />} />
                <Route path="uppdrag" element={<BuyerProjects />} />
                <Route path="uppdrag/:id" element={<ProjectDetail />} />
                <Route path="chatt" element={<ChatPage />} />
                <Route path="profil" element={<ProfilePage />} />
              </Route>

              {/* Supplier dashboard */}
              <Route path="/dashboard/supplier" element={<ProtectedRoute role="supplier"><SupplierLayout /></ProtectedRoute>}>
                <Route index element={<SupplierDashboard />} />
                <Route path="uppdrag" element={<BrowseProjects />} />
                <Route path="uppdrag/:id" element={<ProjectUnlock />} />
                <Route path="offerter" element={<SupplierOffers />} />
                <Route path="chatt" element={<ChatPage />} />
                <Route path="profil" element={<ProfilePage />} />
                <Route path="fakturering" element={<BillingPage />} />
                <Route path="bjud-in" element={<ReferralPage />} />
              </Route>

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/anvandare" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/anvandare/:id" element={<ProtectedRoute role="admin"><AdminUserDetail /></ProtectedRoute>} />
              <Route path="/admin/byraer" element={<ProtectedRoute role="admin"><AdminSuppliers /></ProtectedRoute>} />
              <Route path="/admin/uppdrag" element={<ProtectedRoute role="admin"><AdminProjects /></ProtectedRoute>} />
              <Route path="/admin/offerter" element={<ProtectedRoute role="admin"><AdminOffers /></ProtectedRoute>} />
              <Route path="/admin/notifikationer" element={<ProtectedRoute role="admin"><AdminNotifications /></ProtectedRoute>} />
              <Route path="/admin/installningar" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />
              <Route path="/admin/statistik" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/guider" element={<ProtectedRoute role="admin"><AdminGuides /></ProtectedRoute>} />
              <Route path="/admin/stripe" element={<ProtectedRoute role="admin"><AdminStripeLog /></ProtectedRoute>} />
              <Route path="/admin/audit" element={<ProtectedRoute role="admin"><AdminAuditLog /></ProtectedRoute>} />
              <Route path="/admin/besokare" element={<ProtectedRoute role="admin"><AdminVisitors /></ProtectedRoute>} />

              {/* SEO pillar + sub pages (catch-all) */}
              <Route path="/:category" element={<PillarPage />} />
              <Route path="/:category/:sub" element={<SubPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
