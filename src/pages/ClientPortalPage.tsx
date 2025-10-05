"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Key, Edit, Ban, Plus, Mail, Calendar, Clock, Briefcase, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDataStorage, ClientAccess } from '@/hooks/use-data-storage'; // Importar ClientAccess
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ClientPortalPage: React.FC = () => {
  const { data, setData, saveData } = useDataStorage();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Inativo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleGenerateAccess = () => {
    if (!selectedClientId) {
      toast.error('Por favor, selecione um cliente para gerar o acesso.');
      return;
    }

    const client = data.clients.find(c => c.id === Number(selectedClientId));
    if (!client) {
      toast.error('Cliente não encontrado.');
      return;
    }

    // Verificar se o cliente já possui um acesso ativo ou pendente
    const existingAccess = data.clientAccesses.find(access =>
      access.clientId === client.id && (access.status === 'Ativo' || access.status === 'Pendente')
    );
    if (existingAccess) {
      toast.warning(`O cliente ${client.name} já possui um acesso ${existingAccess.status.toLowerCase()}.`);
      return;
    }

    // Para simplificar, vinculamos todos os processos do cliente.
    // Em uma aplicação real, haveria uma seleção multi-opção de processos.
    const clientProcesses = data.processes
      .filter(p => p.client === client.name)
      .map(p => p.number);

    const newAccess: ClientAccess = {
      id: Date.now(),
      clientId: client.id,
      clientName: client.name,
      email: client.email,
      generatedPassword: Math.random().toString(36).slice(-8), // Senha aleatória simples
      processes: clientProcesses.length > 0 ? clientProcesses : ['Nenhum processo vinculado'],
      creationDate: new Date().toLocaleDateString('pt-BR'),
      lastAccess: '-',
      status: 'Pendente', // Inicialmente pendente até o cliente usar
    };

    setData(prev => ({
      ...prev,
      clientAccesses: [...prev.clientAccesses, newAccess]
    }));
    saveData();
    toast.success(`Acesso gerado para ${client.name}! Senha: ${newAccess.generatedPassword}`, { duration: 5000 });
    setSelectedClientId(null); // Resetar a seleção
  };

  const handleEditAccess = (access: ClientAccess) => {
    toast.info(`Funcionalidade de editar acesso para ${access.clientName} em desenvolvimento!`);
    // Implementar modal de edição aqui
  };

  const handleResetPassword = (access: ClientAccess) => {
    const newPassword = Math.random().toString(36).slice(-8);
    setData(prev => ({
      ...prev,
      clientAccesses: prev.clientAccesses.map(a =>
        a.id === access.id ? { ...a, generatedPassword: newPassword, status: 'Pendente' } : a
      )
    }));
    saveData();
    toast.success(`Senha redefinida para ${access.clientName}! Nova Senha: ${newPassword}`, { duration: 5000 });
  };

  const handleToggleAccessStatus = (access: ClientAccess) => {
    const newStatus = access.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setData(prev => ({
      ...prev,
      clientAccesses: prev.clientAccesses.map(a =>
        a.id === access.id ? { ...a, status: newStatus } : a
      )
    }));
    saveData();
    toast.success(`Acesso de ${access.clientName} ${newStatus === 'Ativo' ? 'ativado' : 'desativado'} com sucesso!`);
  };


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Portal do Cliente</h2>
      <p className="text-muted-foreground">Gere acessos para que seus clientes possam acompanhar o andamento dos processos.</p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg dark:bg-blue-950 dark:border-blue-700">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Como funciona:</h3>
        <ol className="list-decimal list-inside text-blue-700 dark:text-blue-300 space-y-1">
          <li>Selecione um cliente da lista abaixo</li>
          <li>Escolha quais processos ele terá acesso (funcionalidade em desenvolvimento)</li>
          <li>Clique em "Gerar Acesso" para criar um login e senha</li>
          <li>Envie as credenciais para o cliente</li>
        </ol>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Label htmlFor="clientSelect">Selecione um cliente</Label>
            <Select onValueChange={setSelectedClientId} value={selectedClientId || ''}>
              <SelectTrigger id="clientSelect" className="w-full">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {data.clients.map(client => (
                  <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerateAccess} className="w-full md:w-auto">
            <Key className="mr-2 h-4 w-4" /> Gerar Acesso
          </Button>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-4">Acessos Gerados</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.clientAccesses.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-10">Nenhum acesso gerado ainda.</p>
        ) : (
          data.clientAccesses.map((access) => (
            <Card key={access.id} className="relative flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {access.clientName}
                  </CardTitle>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusBadgeClass(access.status))}>
                    {access.status}
                  </span>
                </div>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {access.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" /> Processos: {access.processes.join(', ')}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" /> Criado em: {access.creationDate}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" /> Último Acesso: {access.lastAccess}
                </div>
                <div className="flex items-center">
                  <Key className="h-4 w-4 mr-2" /> Senha: <span className="font-mono text-xs">{access.generatedPassword}</span>
                </div>
              </CardContent>
              <div className="flex justify-end p-4 pt-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditAccess(access)}>
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleResetPassword(access)}>
                  <Key className="h-4 w-4 mr-2" /> Redefinir Senha
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleToggleAccessStatus(access)}>
                  {access.status === 'Ativo' ? <Ban className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />} {access.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientPortalPage;