import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import SearchPage from "./pages/SearchPage";
import Watch from "./pages/Watch";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import UploadPage from "./pages/UploadPage";
import SettingsPage from "./pages/SettingsPage";
import Guidelines from "./pages/Guidelines";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Report from "./pages/Report";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVideos from "./pages/AdminVideos";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminCategories from "./pages/AdminCategories";
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
          <Route path="/browse" element={<Browse />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/report" element={<Report />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/videos" element={<AdminVideos />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
