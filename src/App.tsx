import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import ProcessesPage from "./pages/ProcessesPage";
import CalendarPage from "./pages/CalendarPage";
import FinancialPage from "./pages/FinancialPage";
import DocumentsPage from "./pages/DocumentsPage";
import PublicationsPage from "./pages/PublicationsPage";
import ResearchPage from "./pages/ResearchPage";
import ClientPortalPage from "./pages/ClientPortalPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login"; // Importa a nova página de Login
import { DataStorageProvider } from "./hooks/use-data-storage";
import { SessionContextProvider } from "./components/SessionContextProvider"; // Importa o provedor de sessão

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider> {/* Envolve a aplicação com o provedor de sessão */}
          <DataStorageProvider>
            <Routes>
              <Route path="/login" element={<Login />} /> {/* Rota para a página de Login */}
              <Route path="/" element={<Layout><DashboardPage /></Layout>} />
              <Route path="/clients" element={<Layout><ClientsPage /></Layout>} />
              <Route path="/processes" element={<Layout><ProcessesPage /></Layout>} />
              <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
              <Route path="/financial" element={<Layout><FinancialPage /></Layout>} />
              <Route path="/documents" element={<Layout><DocumentsPage /></Layout>} />
              <Route path="/publications" element={<Layout><PublicationsPage /></Layout>} />
              <Route path="/research" element={<Layout><ResearchPage /></Layout>} />
              <Route path="/portal" element={<Layout><ClientPortalPage /></Layout>} />
              <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
              <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
              <Route path="/help" element={<Layout><HelpPage /></Layout>} />
              <Route path="/logout" element={<Layout><h1 className="text-2xl font-bold">Fazendo Logout...</h1></Layout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </DataStorageProvider>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;