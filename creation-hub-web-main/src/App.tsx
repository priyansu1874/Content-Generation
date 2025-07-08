
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import DashboardPage from "./pages/DashboardPage";
import ContentFormPage from "./pages/ContentFormPage";
import RepositoryPage from "./pages/RepositoryPage";
import CarouselPage from "./pages/CarouselPage";
import ProtectedRoute from "./core/routing/ProtectedRoute";
import NotFound from "./core/routing/NotFound";
import DatabaseInspector from "./components/DatabaseInspector";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/content/:type" element={
            <ProtectedRoute>
              <ContentFormPage />
            </ProtectedRoute>
          } />
          <Route path="/carousel/*" element={
            <ProtectedRoute>
              <CarouselPage />
            </ProtectedRoute>
          } />
          <Route path="/repository" element={
            <ProtectedRoute>
              <RepositoryPage />
            </ProtectedRoute>
          } />
          <Route path="/db-inspector" element={<DatabaseInspector />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
