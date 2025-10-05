"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Search, Trash, User, Building2, Mail, Phone, FileText, MapPin, Info } from 'lucide-react';
import { useDataStorage, Client } from '@/hooks/use-data-storage';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ClientsPage: React.FC = () => {
  const { data, setData, saveData } = useDataStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = data.clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.contact && client.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddClient = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setData(prev => ({
        ...prev,
        clients: prev.clients.filter(client => client.id !== id)
      }));
      saveData();
      toast.success('Cliente excluído com sucesso!');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClient: Client = {
      id: editingClient?.id || Date.now(),
      type: formData.get('clientType') as 'person' | 'company',
      name: formData.get('clientName') as string,
      contact: formData.get('clientContact') as string,
      document: formData.get('clientDocument') as string,
      email: formData.get('clientEmail') as string,
      phone: formData.get('clientPhone') as string,
      status: formData.get('clientStatus') as 'ativo' | 'inativo' | 'pendente',
      address: formData.get('clientAddress') as string,
      notes: formData.get('clientNotes') as string,
    };

    setData(prev => {
      if (editingClient) {
        return {
          ...prev,
          clients: prev.clients.map(client =>
            client.id === newClient.id ? newClient : client
          )
        };
      } else {
        return {
          ...prev,
          clients: [...prev.clients, newClient]
        };
      }
    });
    saveData();
    setIsModalOpen(false);
    toast.success(`Cliente ${editingClient ? 'atualizado' : 'adicionado'} com sucesso!`);
  };

  const getStatusBadgeClass = (status: Client['status']) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inativo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Gestão de Clientes</h2>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddClient} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-10">Nenhum cliente encontrado.</p>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="relative flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {client.type === 'person' ? <User className="h-5 w-5 text-primary" /> : <Building2 className="h-5 w-5 text-primary" />}
                    {client.name}
                  </CardTitle>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusBadgeClass(client.status))}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </div>
                {client.contact && <CardDescription className="mt-1">Contato: {client.contact}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" /> {client.document}
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" /> {client.email}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" /> {client.phone}
                </div>
                {client.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" /> {client.address}
                  </div>
                )}
                {client.notes && (
                  <div className="flex items-start">
                    <Info className="h-4 w-4 mr-2 mt-1 flex-shrink-0" /> <span className="break-words">{client.notes}</span>
                  </div>
                )}
              </CardContent>
              <div className="flex justify-end p-4 pt-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditClient(client)}>
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClient(client.id)}>
                  <Trash className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientType" className="text-right">Tipo</Label>
              <Select name="clientType" defaultValue={editingClient?.type || 'person'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person">Pessoa Física</SelectItem>
                  <SelectItem value="company">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">Nome / Razão Social</Label>
              <Input id="clientName" name="clientName" defaultValue={editingClient?.name || ''} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientContact" className="text-right">Contato</Label>
              <Input id="clientContact" name="clientContact" defaultValue={editingClient?.contact || ''} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientDocument" className="text-right">CPF / CNPJ</Label>
              <Input id="clientDocument" name="clientDocument" defaultValue={editingClient?.document || ''} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientEmail" className="text-right">Email</Label>
              <Input id="clientEmail" name="clientEmail" type="email" defaultValue={editingClient?.email || ''} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientPhone" className="text-right">Telefone</Label>
              <Input id="clientPhone" name="clientPhone" type="tel" defaultValue={editingClient?.phone || ''} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientAddress" className="text-right">Endereço</Label>
              <Input id="clientAddress" name="clientAddress" defaultValue={editingClient?.address || ''} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientStatus" className="text-right">Status</Label>
              <Select name="clientStatus" defaultValue={editingClient?.status || 'ativo'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientNotes" className="text-right">Observações</Label>
              <Textarea id="clientNotes" name="clientNotes" defaultValue={editingClient?.notes || ''} className="col-span-3" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Cliente</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;