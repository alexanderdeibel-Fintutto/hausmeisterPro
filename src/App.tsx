import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import TasksPage from "@/pages/TasksPage";
import TaskDetailPage from "@/pages/TaskDetailPage";
import BuildingsPage from "@/pages/BuildingsPage";
import BuildingDetailPage from "@/pages/BuildingDetailPage";
import CalendarPage from "@/pages/CalendarPage";
import MessagesPage from "@/pages/MessagesPage";
import ChatPage from "@/pages/ChatPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/passwort-vergessen" element={<ForgotPasswordPage />} />
          
          {/* Redirect root to tasks */}
          <Route path="/" element={<Navigate to="/aufgaben" replace />} />
          
          {/* Main App Routes with Layout */}
          <Route element={<AppLayout />}>
            <Route path="/aufgaben" element={<TasksPage />} />
            <Route path="/aufgaben/:id" element={<TaskDetailPage />} />
            <Route path="/objekte" element={<BuildingsPage />} />
            <Route path="/objekte/:id" element={<BuildingDetailPage />} />
            <Route path="/kalender" element={<CalendarPage />} />
            <Route path="/nachrichten" element={<MessagesPage />} />
            <Route path="/nachrichten/:id" element={<ChatPage />} />
            <Route path="/profil" element={<ProfilePage />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
