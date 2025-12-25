import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import Search from "./pages/Search";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Shop from "./pages/Shop";
import Vendor from "./pages/Vendor";
import VendorProducts from "./pages/VendorProducts";
import AIStudio from "./pages/AIStudio";
import Rate from "./pages/Rate";
import QRRate from "./pages/QRRate";
import Report from "./pages/Report";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange={false}
  >
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/search" element={<Search />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/shop/:shopId" element={<Shop />} />
              <Route path="/vendor" element={<Vendor />} />
              <Route path="/vendor/products" element={<VendorProducts />} />
              <Route path="/vendor/ai-studio" element={<AIStudio />} />
              <Route path="/rate/:interactionId" element={<Rate />} />
              <Route path="/qr/:shopId" element={<QRRate />} />
              <Route path="/report/:shopId" element={<Report />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;