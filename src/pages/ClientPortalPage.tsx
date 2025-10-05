"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Key, Edit, Ban, Plus, Mail, Calendar, Clock, Briefcase, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDataStorage } from '@/hooks/use-data-storage';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ClientPortalPage: React.FC = () => {
  const { data } = useDataStorage();

  // Dados de exemplo para acessos gerados (mantidos para demonstração)
  const generatedAccesses = [
    { id: 1, clientName: 'Empresa XYZ Ltda.', email: 'contato@xyz.com', processes: '12345/2023, 67890/2023', creationDate: '15/10/2023', lastAccess: '24/10/2023', status: 'Ativo' },
    { id: 2, clientName: 'Mariana Costa', email: 'mariana.costa@email.com', processes: '54321/2023', creationDate: '20/10/2023', lastAccess: '-', status: 'Pendente' },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Portal do Cliente</h2>
      <p className="text-muted-foreground">Gere acessos para que seus clientes possam acompanhar o andamento dos processos.</p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg dark:bg-blue-950 dark:border-blue-700">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Como funciona:</h3>
        <ol className="list-decimal list-inside text-blue-700 dark:text-blue-300 space-y-1">
          <li>Selecione um cliente da lista abaixo</li>
          <li>Escolha quais processos ele terá acesso</li>
          <li>Clique em "Gerar Acesso" para criar um login e senha</li>
          <li>Envie as credenciais para o cliente</li>
        </ol>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Label htmlFor="clientSelect">Selecione um cliente</Label>
            <Select>
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
          <Button onClick={() => toast.info("Funcionalidade de gerar acesso em desenvolvimento!")} className="w-full md:w-auto">
            <Key className="mr-2 h-4 w-4" /> Gerar Acesso
          </Button>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-4">Acessos Gerados</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {generatedAccesses.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-10">Nenhum acesso gerado ainda.</p>
        ) : (
          generatedAccesses.map((access) => (
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
                  <Briefcase className="h-4 w-4 mr-2" /> Processos: {access.processes}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" /> Criado em: {access.creationDate}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" /> Último Acesso: {access.lastAccess}
                </div>
              </CardContent>
              <div className="flex justify-end p-4 pt-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.info("Editar acesso em desenvolvimento!")}>
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.info("Redefinir senha em desenvolvimento!")}>
                  <Key className="h-4 w-4 mr-2" /> Redefinir Senha
                </Button>
                <Button variant="destructive" size="sm" onClick={() => toast.info("Desativar acesso em desenvolvimento!")}>
                  <Ban className="h-4 w-4 mr-2" /> Desativar
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