"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Key, Edit, Ban, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDataStorage } from '@/hooks/use-data-storage';
import { Label } from '@/components/ui/label'; // Adicionado importação do Label

const ClientPortalPage: React.FC = () => {
  const { data } = useDataStorage();

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
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Processos Vinculados</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Dados de exemplo */}
            <TableRow>
              <TableCell className="font-medium">Empresa XYZ Ltda.</TableCell>
              <TableCell>contato@xyz.com</TableCell>
              <TableCell>12345/2023, 67890/2023</TableCell>
              <TableCell>15/10/2023</TableCell>
              <TableCell>24/10/2023</TableCell>
              <TableCell>
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusBadgeClass('Ativo'))}>Ativo</span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => toast.info("Editar acesso em desenvolvimento!")}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toast.info("Redefinir senha em desenvolvimento!")}>
                  <Key className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toast.info("Desativar acesso em desenvolvimento!")}>
                  <Ban className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Mariana Costa</TableCell>
              <TableCell>mariana.costa@email.com</TableCell>
              <TableCell>54321/2023</TableCell>
              <TableCell>20/10/2023</TableCell>
              <TableCell>-</TableCell>
              <TableCell>
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusBadgeClass('Pendente'))}>Pendente</span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => toast.info("Editar acesso em desenvolvimento!")}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toast.info("Redefinir senha em desenvolvimento!")}>
                  <Key className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toast.info("Desativar acesso em desenvolvimento!")}>
                  <Ban className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientPortalPage;