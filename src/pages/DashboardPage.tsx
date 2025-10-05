"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Importando CardDescription
import { Calendar, Clock, FileText, Users, Bell, Briefcase, ClipboardList, DollarSign, Gavel, UserRound } from 'lucide-react'; // Removido ArrowUpRight, PlusCircle
import { useDataStorage } from '@/hooks/use-data-storage';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const DashboardPage: React.FC = () => {
  const { data } = useDataStorage();
  const navigate = useNavigate();

  // Dados de exemplo para os cards de visão geral
  const metrics = {
    totalClients: data.clients.length,
    activeProcesses: data.processes.filter(p => p.status === 'active').length,
    pendingFinancials: data.financials.filter(f => f.status === 'pending' && new Date(f.dueDate) >= new Date()).length,
    totalLawyers: data.lawyers.length,
  };

  // Exemplo de dados para widgets (pode ser refinado para usar dados reais do `data` hook)
  const deadlines = [
    { title: 'Petição Inicial - Proc. 12345/2023', date: 'Hoje', urgent: true },
    { title: 'Contestação - Proc. 67890/2023', date: 'Amanhã', urgent: false },
    { title: 'Audiência - Proc. 54321/2023', date: 'Em 3 dias', urgent: false },
    { title: 'Recurso - Proc. 98765/2023', date: 'Em 5 dias', urgent: false },
  ];

  const tasks = [
    { title: 'Elaborar petição inicial', time: '10:00' },
    { title: 'Reunião com cliente', time: '14:30' },
    { title: 'Analisar contrato', time: '16:00' },
    { title: 'Prazo para contestação', time: '18:00' },
  ];

  const updates = [
    { title: 'Novo andamento - Proc. 12345/2023', date: 'Hoje, 09:30' },
    { title: 'Publicação no DJE - Proc. 67890/2023', date: 'Ontem, 15:45' },
    { title: 'Decisão publicada - Proc. 54321/2023', date: 'Ontem, 11:20' },
    { title: 'Audiência designada - Proc. 98765/2023', date: '23/10, 16:30' },
  ];

  const appointments = [
    { title: 'Audiência - Proc. 12345/2023', time: '09:00' },
    { title: 'Reunião com equipe', time: '11:00' },
    { title: 'Almoço com cliente', time: '13:00' },
    { title: 'Consulta jurídica', time: '15:30' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-foreground">Bem-vindo(a) de volta, {data.userProfile.displayName}!</h2>
      <p className="text-lg text-muted-foreground">Aqui está um resumo rápido das suas atividades e do seu escritório.</p>

      {/* Seção de Métricas Principais (Mantida como está, pois você gostou) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalClients}</div>
            <p className="text-xs text-muted-foreground">clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processos Ativos</CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.activeProcesses}</div>
            <p className="text-xs text-muted-foreground">processos em andamento</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financeiro Pendente</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.pendingFinancials}</div>
            <p className="text-xs text-muted-foreground">lançamentos a receber</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advogados na Equipe</CardTitle>
            <Gavel className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalLawyers}</div>
            <p className="text-xs text-muted-foreground">advogados cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Atividades Recentes (Melhorada) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card para Próximos Prazos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Próximos Prazos
            </CardTitle>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => navigate('/calendar')}>Ver todos</Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {deadlines.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm py-2 border-b last:border-b-0 border-muted-foreground/20">
                  <span className="truncate font-medium">{item.title}</span>
                  <span className={item.urgent ? "text-red-500 font-semibold text-right sm:text-left" : "text-muted-foreground text-right sm:text-left"}>{item.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card para Minhas Tarefas Hoje */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> Minhas Tarefas Hoje
            </CardTitle>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => toast.info("Funcionalidade de tarefas em desenvolvimento!")}>Ver todas</Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {tasks.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm py-2 border-b last:border-b-0 border-muted-foreground/20">
                  <span className="truncate font-medium">{item.title}</span>
                  <span className="text-muted-foreground text-right sm:text-left">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card para Últimas Atualizações */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Últimas Atualizações
            </CardTitle>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => toast.info("Funcionalidade de atualizações em desenvolvimento!")}>Ver todas</Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {updates.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm py-2 border-b last:border-b-0 border-muted-foreground/20">
                  <span className="truncate font-medium">{item.title}</span>
                  <span className="text-muted-foreground text-right sm:text-left">{item.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card para Agenda do Dia */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Agenda do Dia
            </CardTitle>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => navigate('/calendar')}>Ver agenda completa</Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {appointments.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm py-2 border-b last:border-b-0 border-muted-foreground/20">
                  <span className="truncate font-medium">{item.title}</span>
                  <span className="text-muted-foreground text-right sm:text-left">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Acesso Rápido (Melhorada com Cards individuais) */}
      <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">Acesso Rápido</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors group" onClick={() => navigate('/processes')}>
          <Briefcase className="h-10 w-10 mb-3 text-primary group-hover:text-primary-foreground transition-colors" />
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-accent-foreground transition-colors">Novo Processo</CardTitle>
          <CardDescription className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 transition-colors">Crie um novo processo judicial</CardDescription>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors group" onClick={() => toast.info("Funcionalidade de nova tarefa em desenvolvimento!")}>
          <ClipboardList className="h-10 w-10 mb-3 text-primary group-hover:text-primary-foreground transition-colors" />
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-accent-foreground transition-colors">Nova Tarefa</CardTitle>
          <CardDescription className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 transition-colors">Adicione uma nova tarefa à sua lista</CardDescription>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors group" onClick={() => navigate('/calendar')}>
          <Calendar className="h-10 w-10 mb-3 text-primary group-hover:text-primary-foreground transition-colors" />
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-accent-foreground transition-colors">Agendar Compromisso</CardTitle>
          <CardDescription className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 transition-colors">Marque audiências, reuniões e prazos</CardDescription>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors group" onClick={() => navigate('/financial')}>
          <DollarSign className="h-10 w-10 mb-3 text-primary group-hover:text-primary-foreground transition-colors" />
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-accent-foreground transition-colors">Lançar Financeiro</CardTitle>
          <CardDescription className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 transition-colors">Registre receitas ou despesas</CardDescription>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors group" onClick={() => navigate('/clients')}>
          <Users className="h-10 w-10 mb-3 text-primary group-hover:text-primary-foreground transition-colors" />
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-accent-foreground transition-colors">Novo Cliente</CardTitle>
          <CardDescription className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 transition-colors">Cadastre um novo cliente</CardDescription>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors group" onClick={() => navigate('/documents')}>
          <FileText className="h-10 w-10 mb-3 text-primary group-hover:text-primary-foreground transition-colors" />
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-accent-foreground transition-colors">Upload Documento</CardTitle>
          <CardDescription className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 transition-colors">Envie documentos importantes</CardDescription>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors group" onClick={() => navigate('/publications')}>
          <Bell className="h-10 w-10 mb-3 text-primary group-hover:text-primary-foreground transition-colors" />
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-accent-foreground transition-colors">Ver Publicações</CardTitle>
          <CardDescription className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 transition-colors">Acompanhe diários oficiais</CardDescription>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors group" onClick={() => navigate('/settings')}>
          <Gavel className="h-10 w-10 mb-3 text-primary group-hover:text-primary-foreground transition-colors" />
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-accent-foreground transition-colors">Gerenciar Advogados</CardTitle>
          <CardDescription className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 transition-colors">Adicione e edite advogados</CardDescription>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;