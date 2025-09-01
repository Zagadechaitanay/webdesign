import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import SemesterPageWrapper from "./pages/SemesterPageWrapper";
import About from "./pages/About";
import AdminRoute from "./components/AdminRoute";
import NotAuthorized from "./pages/NotAuthorized";
import StudentDashboard from "./pages/StudentDashboard";
import BranchSubjectsPage from "./pages/BranchSubjectsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/semester/:semester" element={<SemesterPageWrapper />} />
          <Route path="/about" element={<About />} />
          <Route path="/not-authorized" element={<NotAuthorized />} />
          <Route path="/branch/:branchName" element={<BranchSubjectsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
