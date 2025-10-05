"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Calendar, Clock, FileText, FolderOpen, Info, PlusCircle, Save, Users } from 'lucide-react';
import { useDataStorage } from '@/hooks/use-data-storage';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const DashboardPage: React.FC = () => {
  const { data, selectDirectory, saveData, storagePath } = useDataStorage();
  const navigate = useNavigate();

  // Exemplo de dados para widgets (pode ser refinado para usar dados reais do `data` hook)
  const deadlines = [
    { title: 'Processo nº 12345/2023', date: 'Hoje', urgent: true },
    { title: 'Processo nº 67890/2023', date: 'Amanhã', urgent: false },
    { title: 'Processo nº 54321/2023', date: 'Em 3 dias', urgent: false },
    { title: 'Processo nº 98765/2023', date: 'Em 5 dias', urgent: false },
  ];

  const tasks = [
    { title: 'Elaborar petição inicial', time: '10:00' },
    { title: 'Reunião com cliente', time: '14:30' },
    { title: 'Analisar contrato', time: '16:00' },
    { title: 'Prazo para contestação', time: '18:00' },
  ];

  const updates = [
    { title: 'Novo andamento - Processo 12345/2023', date: 'Hoje, 09:30' },
    { title: 'Publicação no DJE - Processo 67890/2023', date: 'Ontem, 15:45' },
    { title: 'Decisão publicada - Processo 54321/2023', date: 'Ontem, 11:20' },
    { title: 'Audiência designada - Processo 98765/2023', date: '23/10, 16:30' },
  ];

  const appointments = [
    { title: 'Audiência - Processo 12345/2023', time: '09:00' },
    { title: 'Reunião com equipe', time: '11:00' },
    { title: 'Almoço com cliente', time: '13:00' },
    { title: 'Consulta jurídica', time: '15:30' },
  ];

  const handleSelectDirectory = async () => {
    await selectDirectory();
  };

  const handleSaveData = async () => {
    await saveData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-4">
        <Button onClick={handleSelectDirectory} variant="outline" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Selecionar Diretório
        </Button>
        <Button onClick={handleSaveData} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
          <Save className="h-4 w-4" />
          Salvar Dados
        </Button>
      </div>

      <div className="flex items-center p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500 text-blue-800 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200">
        <Info className="h-5 w-5 mr-2" />
        Diretório de salvamento: <span className="font-semibold ml-1">{storagePath}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Prazos</CardTitle>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => navigate('/calendar')}>Ver todos</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deadlines.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{item.title}</span>
                  <span className={item.urgent ? "text-red-500 font-semibold" : "text-muted-foreground"}>{item.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Tarefas Hoje</CardTitle>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => toast.info("Funcionalidade de tarefas em desenvolvimento!")}>Ver todas</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{item.title}</span>
                  <span className="text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Últimas Atualizações</CardTitle>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => toast.info("Funcionalidade de atualizações em desenvolvimento!")}>Ver todas</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {updates.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{item.title}</span>
                  <span className="text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agenda do Dia</CardTitle>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => navigate('/calendar')}>Ver agenda completa</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {appointments.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{item.title}</span>
                  <span className="text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Acesso Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => navigate('/processes')}>
              <PlusCircle className="h-6 w-6 mb-2" />
              <span>Novo Processo</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => toast.info("Funcionalidade de nova tarefa em desenvolvimento!")}>
              <FileText className="h-6 w-6 mb-2" />
              <span>Nova Tarefa</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => navigate('/calendar')}>
              <Calendar className="h-6 w-6 mb-2" />
              <span>Agendar Compromisso</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => navigate('/financial')}>
              <ArrowUpRight className="h-6 w-6 mb-2" />
              <span>Lançar Receita</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;