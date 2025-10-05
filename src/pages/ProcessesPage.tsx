"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Plus, Search, Trash, Eye, Archive } from 'lucide-react';
import { useDataStorage, Process } from '@/hooks/use-data-storage';
import { toast } from 'sonner';

const ProcessesPage: React.FC = () => {
  const { data, setData, saveData } = useDataStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterResponsible, setFilterResponsible] = useState('');
  const [filterType, setFilterType] = useState('');

  const statusLabels = {
    active: 'Ativo',
    suspended: 'Suspenso',
    archived: 'Arquivado',
    extinct: 'Extinto',
  };

  const filteredProcesses = data.processes.filter(process => {
    const matchesSearch = searchTerm === '' ||
      process.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.opposingParty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || process.status === filterStatus;
    const matchesResponsible = filterResponsible === '' || process.responsible === filterResponsible;
    const matchesType = filterType === '' || process.type === filterType;
    return matchesSearch && matchesStatus && matchesResponsible && matchesType;
  });

  const handleAddProcess = () => {
    setEditingProcess(null);
    setIsModalOpen(true);
  };

  const handleEditProcess = (process: Process) => {
    setEditingProcess(process);
    setIsModalOpen(true);
  };

  const handleDeleteProcess = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este processo?')) {
      setData(prev => ({
        ...prev,
        processes: prev.processes.filter(process => process.id !== id)
      }));
      saveData();
      toast.success('Processo excluído com sucesso!');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProcess: Process = {
      id: editingProcess?.id || Date.now(),
      number: formData.get('processNumber') as string,
      client: formData.get('processClient') as string,
      opposingParty: formData.get('processOpposingParty') as string,
      type: formData.get('processType') as string,
      status: formData.get('processStatus') as 'active' | 'suspended' | 'archived' | 'extinct',
      responsible: formData.get('processResponsible') as string,
      lastUpdate: formData.get('processLastUpdate') as string,
    };

    setData(prev => {
      if (editingProcess) {
        return {
          ...prev,
          processes: prev.processes.map(process =>
            process.id === newProcess.id ? newProcess : process
          )
        };
      } else {
        return {
          ...prev,
          processes: [...prev.processes, newProcess]
        };
      }
    });
    saveData();
    setIsModalOpen(false);
    toast.success(`Processo ${editingProcess ? 'atualizado' : 'adicionado'} com sucesso!`);
  };

  const getStatusBadgeClass = (status: Process['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'extinct': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Gestão de Processos</h2>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nº do Processo, Cliente, Parte Contrária..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddProcess} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Novo Processo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="filterStatus">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger id="filterStatus">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="suspended">Suspenho</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
              <SelectItem value="extinct">Extinto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="filterResponsible">Advogado Responsável</Label>
          <Select value={filterResponsible} onValueChange={setFilterResponsible}>
            <SelectTrigger id="filterResponsible">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {data.lawyers.map(lawyer => (
                <SelectItem key={lawyer.id} value={lawyer.name}>{lawyer.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="filterType">Tipo</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger id="filterType">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="Cível">Cível</SelectItem>
              <SelectItem value="Criminal">Criminal</SelectItem>
              <SelectItem value="Trabalhista">Trabalhista</SelectItem>
              <SelectItem value="Tributário">Tributário</SelectItem>
              <SelectItem value="Previdenciário">Previdenciário</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº do Processo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Parte Contrária</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Advogado Responsável</TableHead>
              <TableHead>Última Movimentação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProcesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Nenhum processo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProcesses.map((process) => (
                <TableRow key={process.id}>
                  <TableCell className="font-medium text-blue-600 dark:text-blue-400">{process.number}</TableCell>
                  <TableCell>{process.client}</TableCell>
                  <TableCell>{process.opposingParty}</TableCell>
                  <TableCell>{process.type}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(process.status)}`}>
                      {statusLabels[process.status]}
                    </span>
                  </TableCell>
                  <TableCell>{process.responsible}</TableCell>
                  <TableCell>{new Date(process.lastUpdate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => toast.info("Funcionalidade de ver detalhes em desenvolvimento!")}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditProcess(process)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toast.info("Funcionalidade de arquivar em desenvolvimento!")}>
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProcess(process.id)}>
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProcess ? 'Editar Processo' : 'Adicionar Novo Processo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="processNumber" className="text-right">Número</Label>
              <Input id="processNumber" name="processNumber" defaultValue={editingProcess?.number || ''} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="processClient" className="text-right">Cliente</Label>
              <Select name="processClient" defaultValue={editingProcess?.client || ''}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {data.clients.map(client => (
                    <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="processOpposingParty" className="text-right">Parte Contrária</Label>
              <Input id="processOpposingParty" name="processOpposingParty" defaultValue={editingProcess?.opposingParty || ''} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="processType" className="text-right">Tipo</Label>
              <Select name="processType" defaultValue={editingProcess?.type || ''}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cível">Cível</SelectItem>
                  <SelectItem value="Criminal">Criminal</SelectItem>
                  <SelectItem value="Trabalhista">Trabalhista</SelectItem>
                  <SelectItem value="Tributário">Tributário</SelectItem>
                  <SelectItem value="Previdenciário">Previdenciário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="processStatus" className="text-right">Status</Label>
              <Select name="processStatus" defaultValue={editingProcess?.status || 'active'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                  <SelectItem value="extinct">Extinto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="processResponsible" className="text-right">Advogado</Label>
              <Select name="processResponsible" defaultValue={editingProcess?.responsible || ''}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um advogado" />
                </SelectTrigger>
                <SelectContent>
                  {data.lawyers.map(lawyer => (
                    <SelectItem key={lawyer.id} value={lawyer.name}>{lawyer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="processLastUpdate" className="text-right">Última Mov.</Label>
              <Input id="processLastUpdate" name="processLastUpdate" type="date" defaultValue={editingProcess?.lastUpdate || ''} className="col-span-3" required />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Processo</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProcessesPage;