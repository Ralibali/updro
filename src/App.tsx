import { lazy, Suspense, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { usePageTracking } from "@/hooks/usePageTracking";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import ProtectedRoute from "@/components/ProtectedRoute";
import CookieConsent from "@/components/CookieConsent";
import { COMPARISON_PAGES } from "./lib/seoComparisons";
import { getNoindexSeoRoutes } from "./lib/seoStatic";
import SupplierLayout from "@/components/SupplierLayout";
import BuyerLayout from "@/components/BuyerLayout";

import Index from "./pages/Index";

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
const ProspectingPrivacyNoticePage = lazy(() => import("./pages/ProspectingPrivacyNoticePage"));
const ReportContentPage = lazy(() => import("./pages/ReportContentPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SupplierLandingPage = lazy(() => import("./pages/SupplierLandingPage"));
const EditorialPolicyPage = lazy(() => import("./pages/EditorialPolicyPage"));
const MetodPage = lazy(() => import("./pages/MetodPage"));
const AdminContentPlanner = lazy(() => import("./pages/admin/AdminContentPlanner"));
const PriceGuidePage = lazy(() => import("./pages/PriceGuidePage"));

const RedirectToArtikel = () => {
  const params = useParams();
  const slug = params.slug || params.artikel;
  return <Navigate to={slug ? `/artiklar/${slug}` : '/artiklar'} replace />;
};

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

const AgencyCityPage = lazy(() => import("./pages/seo/AgencyCityPage"));
const AgencyCityCategoryPage = lazy(() => import("./pages/seo/AgencyCityCategoryPage"));
const AgencyCategoryPage = lazy(() => import("./pages/seo/AgencyCategoryPage"));
const ServicePage = lazy(() => import("./pages/seo/ServicePage"));
const HittaWebbbyraPage = lazy(() => import("./pages/seo/SEOLandingPages").then(m => ({ default: m.HittaWebbbyraPage })));
const HittaSeoByraPage = lazy(() => import("./pages/seo/SEOLandingPages").then(m => ({ default: m.HittaSeoByraPage })));
const HittaDigitalByraPage = lazy(() => import("./pages/seo/SEOLandingPages").then(m => ({ default: m.HittaDigitalByraPage })));
const PartnaAlternativPage = lazy(() => import("./pages/seo/PartnaAlternativPage"));
const BytFranPartnaPage = lazy(() => import("./pages/seo/BytFranPartnaPage"));

const BuyerDashboard = lazy(() => import("./pages/buyer/BuyerDashboard"));
const BuyerProjects = lazy(() => import("./pages/buyer/BuyerProjects"));
const ProjectDetail = lazy(() => import("./pages/buyer/ProjectDetail"));
const SupplierDashboard = lazy(() => import("./pages/supplier/SupplierDashboard"));
const BrowseProjects = lazy(() => import("./pages/supplier/BrowseProjects"));
const ProjectUnlock = lazy(() => import("./pages/supplier/ProjectUnlock"));
const SupplierOffers = lazy(() => import("./pages/supplier/SupplierOffers"));
const BillingPage = lazy(() => import("./pages/supplier/BillingPage"));
const ReferralPage = lazy(() => import("./pages/supplier/ReferralPage"));

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
const AdminArticleGenerator = lazy(() => import("./pages/admin/AdminArticleGenerator"));
const AdminStripeLog = lazy(() => import("./pages/admin/AdminStripeLog"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminVisitors = lazy(() => import("./pages/admin/AdminVisitors"));
const AdminMarketplaceHealth = lazy(() => import("./pages/admin/AdminMarketplaceHealth"));
const AdminFunctionLogs = lazy(() => import("./pages/admin/AdminFunctionLogs"));
const AdminProspecting = lazy(() => import("./pages/admin/AdminProspecting"));

const queryClient = new QueryClient();
const PageLoader = () => <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
const PageTracker = () => { usePageTracking(); return null; };

const NoindexGuard = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '') || '/';
    const noindexPaths = new Set(getNoindexSeoRoutes().map(route => route.path));
    const privatePrefixes = ['/admin', '/dashboard'];
    const privateExact = ['/logga-in', '/registrera', '/registrera/byra', '/aterstall-losenord', '/landing', '/landing/byra'];
    const shouldNoindex = noindexPaths.has(path) || privateExact.includes(path) || privatePrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
    if (!shouldNoindex || typeof document === 'undefined') return;
    const applyNoindex = () => {
      let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
      robots.content = 'noindex, nofollow';
    };
    applyNoindex(); window.setTimeout(applyNoindex, 0);
  }, [location.pathname]);
  return null;
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider><Toaster /><Sonner /><BrowserRouter><AuthProvider><MotionConfig reducedMotion="user">
      <a href="#main-content" className="skip-link">Hoppa till innehåll</a><PageTracker /><NoindexGuard />
      <Suspense fallback={<PageLoader />}><div id="main-content"><Routes>
        <Route path="/" element={<Index />} />
        <Route path="/publicera" element={<ProjectWizard />} />
        <Route path="/byraer" element={<BrowseAgenciesPage />} />
        <Route path="/byraer/:slug" element={<AgencyProfilePage />} />
        <Route path="/priser" element={<PricingPage />} />
        <Route path="/priser/:slug" element={<PriceGuidePage />} />
        <Route path="/om-oss" element={<AboutPage />} />
        <Route path="/support" element={<PlaceholderPage title="Support" />} />
        <Route path="/integritetspolicy" element={<PrivacyPolicyPage />} />
        <Route path="/integritet/prospektering" element={<ProspectingPrivacyNoticePage />} />
        <Route path="/villkor" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/rapportera-innehall" element={<ReportContentPage />} />
        <Route path="/logga-in" element={<LoginPage />} />
        <Route path="/registrera" element={<RegisterPage />} />
        <Route path="/registrera/byra" element={<RegisterSupplierPage />} />
        <Route path="/aterstall-losenord" element={<PlaceholderPage title="Återställ lösenord" />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/landing/byra" element={<SupplierLandingPage />} />
        <Route path="/guider" element={<Navigate to="/artiklar" replace />} />
        <Route path="/guider/:slug" element={<RedirectToArtikel />} />
        <Route path="/kunskapsbank" element={<Navigate to="/artiklar" replace />} />
        <Route path="/kunskapsbank/:artikel" element={<RedirectToArtikel />} />
        <Route path="/redaktionell-policy" element={<EditorialPolicyPage />} />
        <Route path="/metod" element={<MetodPage />} />
        <Route path="/hitta-webbyra" element={<HittaWebbbyraPage />} />
        <Route path="/hitta-seo-byra" element={<HittaSeoByraPage />} />
        <Route path="/hitta-digital-byra" element={<HittaDigitalByraPage />} />
        <Route path="/partna-alternativ" element={<PartnaAlternativPage />} />
        <Route path="/updro-vs-partna" element={<Navigate to="/partna-alternativ" replace />} />
        <Route path="/jamfor-partna" element={<Navigate to="/partna-alternativ" replace />} />
        <Route path="/alternativ-till-partna" element={<Navigate to="/partna-alternativ" replace />} />
        <Route path="/for-byraer/byt-fran-partna" element={<BytFranPartnaPage />} />
        <Route path="/artiklar" element={<ArticlesIndex />} />
        <Route path="/artiklar/:slug" element={<ArticlePage />} />
        <Route path="/verktyg" element={<ToolsIndex />} />
        <Route path="/verktyg/:slug" element={<ToolPage />} />
        <Route path="/stader" element={<CitiesIndex />} />
        <Route path="/stader/:city" element={<CityHubPage />} />
        <Route path="/jamfor" element={<ComparisonsIndex />} />
        <Route path="/byraer/kategori/:kategori" element={<AgencyCategoryPage />} />
        <Route path="/byraer/:stad/:kategori" element={<AgencyCityCategoryPage />} />
        <Route path="/byraer/:stad" element={<AgencyCityPage />} />
        <Route path="/leveranser/:tjanst" element={<ServicePage />} />
        <Route path="/admin/innehallsplan" element={<ProtectedRoute role="admin"><AdminContentPlanner /></ProtectedRoute>} />
        <Route path="/admin/prospektering" element={<ProtectedRoute role="admin"><AdminProspecting /></ProtectedRoute>} />
        {COMPARISON_PAGES.map(p => <Route key={p.slug} path={`/${p.slug}`} element={<ComparisonPage />} />)}
        <Route path="/dashboard/buyer" element={<ProtectedRoute role="buyer"><BuyerLayout /></ProtectedRoute>}><Route index element={<BuyerDashboard />} /><Route path="uppdrag" element={<BuyerProjects />} /><Route path="uppdrag/:id" element={<ProjectDetail />} /><Route path="chatt" element={<ChatPage />} /><Route path="profil" element={<ProfilePage />} /></Route>
        <Route path="/dashboard/supplier" element={<ProtectedRoute role="supplier"><SupplierLayout /></ProtectedRoute>}><Route index element={<SupplierDashboard />} /><Route path="uppdrag" element={<BrowseProjects />} /><Route path="uppdrag/:id" element={<ProjectUnlock />} /><Route path="offerter" element={<SupplierOffers />} /><Route path="chatt" element={<ChatPage />} /><Route path="profil" element={<ProfilePage />} /><Route path="fakturering" element={<BillingPage />} /><Route path="bjud-in" element={<ReferralPage />} /></Route>
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
        <Route path="/admin/artikelgenerator" element={<ProtectedRoute role="admin"><AdminArticleGenerator /></ProtectedRoute>} />
        <Route path="/admin/stripe" element={<ProtectedRoute role="admin"><AdminStripeLog /></ProtectedRoute>} />
        <Route path="/admin/audit" element={<ProtectedRoute role="admin"><AdminAuditLog /></ProtectedRoute>} />
        <Route path="/admin/besokare" element={<ProtectedRoute role="admin"><AdminVisitors /></ProtectedRoute>} />
        <Route path="/admin/marketplace-health" element={<ProtectedRoute role="admin"><AdminMarketplaceHealth /></ProtectedRoute>} />
        <Route path="/admin/edge-funktioner" element={<ProtectedRoute role="admin"><AdminFunctionLogs /></ProtectedRoute>} />
        <Route path="/:category" element={<PillarPage />} />
        <Route path="/:category/:sub" element={<SubPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes></div></Suspense><CookieConsent />
    </MotionConfig></AuthProvider></BrowserRouter></TooltipProvider>
  </QueryClientProvider></ThemeProvider>
);

export default App;
