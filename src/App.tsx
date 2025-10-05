import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout"; // Importa o Layout
import DashboardPage from "./pages/DashboardPage"; // Nova página do Dashboard
import ClientsPage from "./pages/ClientsPage"; // Nova página de Clientes
import ProcessesPage from "./pages/ProcessesPage"; // Nova página de Processos
import CalendarPage from "./pages/CalendarPage"; // Nova página de Agenda
import FinancialPage from "./pages/FinancialPage"; // Nova página Financeira
import DocumentsPage from "./pages/DocumentsPage"; // Nova página de Documentos
import PublicationsPage from "./pages/PublicationsPage"; // Nova página de Publicações
import ResearchPage from "./pages/ResearchPage"; // Nova página de Pesquisa Jurídica
import ClientPortalPage from "./pages/ClientPortalPage"; // Nova página de Portal do Cliente
import ChatPage from "./pages/ChatPage"; // Nova página de Chat Interno
import SettingsPage from "./pages/SettingsPage"; // Nova página de Configurações
import NotFound from "./pages/NotFound";
import { DataStorageProvider } from "./hooks/use-data-storage"; // Importa o provedor de dados

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DataStorageProvider> {/* Envolve a aplicação com o provedor de dados */}
          <Layout> {/* Envolve as rotas com o Layout */}
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/processes" element={<ProcessesPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/financial" element={<FinancialPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/publications" element={<PublicationsPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/portal" element={<ClientPortalPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Rotas de Ajuda e Sair podem ser tratadas com modais ou redirecionamentos */}
              <Route path="/help" element={<h1 className="text-2xl font-bold">Página de Ajuda</h1>} />
              <Route path="/logout" element={<h1 className="text-2xl font-bold">Fazendo Logout...</h1>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </DataStorageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;