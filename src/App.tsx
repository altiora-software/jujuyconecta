import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Transport from "./pages/Transport";
import Resources from "./pages/Resources";
import Jobs from "./pages/Jobs";
import Security from "./pages/Security";
import Admin from "./pages/Admin";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Podcast from "./pages/Podcast";
import DiarioPresentacion from "./pages/Diario";
import ApoyarPage from "./pages/Apoyar";
import Agenda from "./pages/servicios/Agenda";
import AllServicesPage from "./pages/AllServicesPage";
import Mantenimiento from "./pages/servicios/Directorio";
import { ScrollToTop } from "./components/common/ScrollUp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/podcast" element={<Podcast />} />
        <Route path="/diario" element={<DiarioPresentacion />} />
        <Route path="/apoyar" element={<ApoyarPage />} />
        <Route path="/servicios/agenda" element={<Agenda />} />
        <Route path="/servicios/directorio" element={<Mantenimiento />} />
        <Route path="/servicios/cursos" element={<Mantenimiento />} />
        <Route path="/servicios/mentorias" element={<Mantenimiento />} />
        <Route path="/servicios/asesoria-startup" element={<Mantenimiento />} />
        <Route path="/servicios/marketplace" element={<Mantenimiento />} />
        <Route path="/servicios" element={<AllServicesPage />} />
        <Route path="/terminos" element={<TermsAndConditions />} />
        <Route path="/privacidad" element={<PrivacyPolicy />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/security" element={<Security />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/notifications" element={<Notifications />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
