"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Key, Edit, Ban, Plus, Mail, Calendar, Clock, Briefcase, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDataStorage, ClientAccess } from '@/hooks/use-data-storage';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const ClientPortalPage: React.FC = () => {
  const { data, setData, saveData } = useDataStorage();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClientAccess, setEditingClientAccess] = useState<ClientAccess | null>(null);
  const [editFormState, setEditFormState] = useState<Partial<ClientAccess>>({});

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
    setEditingClientAccess(access);
    setEditFormState({
      email: access.email,
      processes: access.processes,
      status: access.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (field: keyof ClientAccess, value: any) => {
    setEditFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClientAccess) return;

    const updatedAccess: ClientAccess = {
      ...editingClientAccess,
      email: editFormState.email || editingClientAccess.email,
      processes: editFormState.processes || editingClientAccess.processes,
      status: (editFormState.status as 'Ativo' | 'Pendente' | 'Inativo') || editingClientAccess.status,
    };

    setData(prev => ({
      ...prev,
      clientAccesses: prev.clientAccesses.map(a =>
        a.id === updatedAccess.id ? updatedAccess : a
      )
    }));
    saveData();
    toast.success(`Acesso de ${updatedAccess.clientName} atualizado com sucesso!`);
    setIsEditModalOpen(false);
    setEditingClientAccess(null);
    setEditFormState({});
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

  const handleSendAccess = (access: ClientAccess) => {
    toast.info(`Simulando envio de acesso para ${access.email}. Senha: ${access.generatedPassword}`, { duration: 5000 });
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
              <div className="flex flex-col sm:flex-row justify-end p-4 pt-0 gap-2"> {/* Alterado para flex-col em mobile */}
                <Button variant="outline" size="sm" onClick={() => handleEditAccess(access)} className="w-full sm:w-auto">
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleResetPassword(access)} className="w-full sm:w-auto">
                  <Key className="h-4 w-4 mr-2" /> Redefinir Senha
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSendAccess(access)} className="w-full sm:w-auto">
                  <Mail className="h-4 w-4 mr-2" /> Enviar Acesso
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleToggleAccessStatus(access)} className="w-full sm:w-auto">
                  {access.status === 'Ativo' ? <Ban className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />} {access.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Edição de Acesso do Cliente */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Acesso do Cliente: {editingClientAccess?.clientName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editEmail" className="text-right">Email</Label>
              <Input
                id="editEmail"
                name="editEmail"
                type="email"
                value={editFormState.email || ''}
                onChange={(e) => handleEditFormChange('email', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editProcesses" className="text-right">Processos</Label>
              <Textarea
                id="editProcesses"
                name="editProcesses"
                value={editFormState.processes?.join(', ') || ''}
                onChange={(e) => handleEditFormChange('processes', e.target.value.split(',').map(p => p.trim()).filter(p => p !== ''))}
                className="col-span-3"
                placeholder="Separe os números dos processos por vírgula"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editStatus" className="text-right">Status</Label>
              <Select
                name="editStatus"
                value={editFormState.status || 'Pendente'}
                onValueChange={(value: 'Ativo' | 'Pendente' | 'Inativo') => handleEditFormChange('status', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPortalPage;