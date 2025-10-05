"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Calendar, Clock, FileText, PlusCircle, Users, Bell, Briefcase, ClipboardList, DollarSign, Gavel, UserRound } from 'lucide-react';
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

      {/* Seção de Métricas Principais */}
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

      {/* Seção de Atividades Recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate">{item.title}</span>
                  <span className={item.urgent ? "text-red-500 font-semibold" : "text-muted-foreground"}>{item.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate">{item.title}</span>
                  <span className="text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate">{item.title}</span>
                  <span className="text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate">{item.title}</span>
                  <span className="text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Acesso Rápido */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Acesso Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col h-auto py-6 px-4 items-center justify-center text-center group hover:bg-accent/50 transition-colors" onClick={() => navigate('/processes')}>
              <Briefcase className="h-8 w-8 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
              <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground transition-colors">Novo Processo</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-6 px-4 items-center justify-center text-center group hover:bg-accent/50 transition-colors" onClick={() => toast.info("Funcionalidade de nova tarefa em desenvolvimento!")}>
              <FileText className="h-8 w-8 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
              <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground transition-colors">Nova Tarefa</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-6 px-4 items-center justify-center text-center group hover:bg-accent/50 transition-colors" onClick={() => navigate('/calendar')}>
              <Calendar className="h-8 w-8 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
              <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground transition-colors">Agendar Compromisso</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-6 px-4 items-center justify-center text-center group hover:bg-accent/50 transition-colors" onClick={() => navigate('/financial')}>
              <DollarSign className="h-8 w-8 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
              <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground transition-colors">Lançar Receita</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-6 px-4 items-center justify-center text-center group hover:bg-accent/50 transition-colors" onClick={() => navigate('/clients')}>
              <UserRound className="h-8 w-8 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
              <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground transition-colors">Novo Cliente</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-6 px-4 items-center justify-center text-center group hover:bg-accent/50 transition-colors" onClick={() => navigate('/documents')}>
              <FileText className="h-8 w-8 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
              <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground transition-colors">Upload Documento</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-6 px-4 items-center justify-center text-center group hover:bg-accent/50 transition-colors" onClick={() => navigate('/publications')}>
              <Bell className="h-8 w-8 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
              <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground transition-colors">Ver Publicações</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-6 px-4 items-center justify-center text-center group hover:bg-accent/50 transition-colors" onClick={() => navigate('/settings')}>
              <Gavel className="h-8 w-8 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
              <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground transition-colors">Gerenciar Advogados</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;