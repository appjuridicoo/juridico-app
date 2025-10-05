"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, ArrowUp, Scale, Edit, Plus, Search, Trash, TriangleAlert, Check, Clock } from 'lucide-react';
import { useDataStorage, FinancialItem } from '@/hooks/use-data-storage';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const FinancialPage: React.FC = () => {
  const { data, setData, saveData } = useDataStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFinancial, setEditingFinancial] = useState<FinancialItem | null>(null);
  const [modalType, setModalType] = useState<'revenue' | 'expense'>('revenue');
  const [paymentType, setPaymentType] = useState<'single' | 'installment'>('single');
  const [activeTab, setActiveTab] = useState<'invoices' | 'timesheet' | 'reports'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const filteredFinancials = data.financials.filter(item => {
    const clientName = data.clients.find(c => c.id === item.clientId)?.name || 'N/A';
    return (
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  let monthIncome = 0;
  let monthExpense = 0;
  let totalPending = 0;
  let pendingCount = 0;

  data.financials.forEach(item => {
    const dueDate = new Date(item.dueDate + 'T00:00:00');
    const itemYear = dueDate.getFullYear();
    const itemMonth = dueDate.getMonth();

    if (item.status === 'paid' && item.paymentDate) {
      const paymentDate = new Date(item.paymentDate + 'T00:00:00');
      if (paymentDate.getFullYear() === currentYear && paymentDate.getMonth() === currentMonth) {
        if (item.type === 'revenue') monthIncome += item.value;
        if (item.type === 'expense') monthExpense += item.value;
      }
    } else {
      if (item.type === 'revenue') {
        totalPending += item.value;
        pendingCount++;
      }
    }
  });

  const handleAddFinancial = (type: 'revenue' | 'expense') => {
    setEditingFinancial(null);
    setModalType(type);
    setPaymentType('single');
    setIsModalOpen(true);
  };

  const handleEditFinancial = (item: FinancialItem) => {
    setEditingFinancial(item);
    setModalType(item.type);
    setPaymentType('single'); // Edição não permite alterar parcelamento
    setIsModalOpen(true);
  };

  const handleDeleteFinancial = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      setData(prev => ({
        ...prev,
        financials: prev.financials.filter(item => item.id !== id)
      }));
      saveData();
      toast.success('Lançamento excluído com sucesso!');
    }
  };

  const handleTogglePaymentStatus = (item: FinancialItem) => {
    setData(prev => ({
      ...prev,
      financials: prev.financials.map(f =>
        f.id === item.id
          ? {
              ...f,
              status: f.status === 'paid' ? 'pending' : 'paid',
              paymentDate: f.status === 'paid' ? null : new Date().toISOString().split('T')[0],
            }
          : f
      )
    }));
    saveData();
    toast.success('Status de pagamento atualizado!');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const clientId = formData.get('financialClient') === 'null' ? null : Number(formData.get('financialClient'));
    const description = formData.get('financialDescription') as string;
    const totalValue = parseFloat(formData.get('financialValue') as string);
    const firstDueDate = formData.get('financialDueDate') as string;
    const status = formData.get('financialStatus') as 'paid' | 'pending';
    const notes = formData.get('financialNotes') as string;

    if (editingFinancial) {
      setData(prev => ({
        ...prev,
        financials: prev.financials.map(item =>
          item.id === editingFinancial.id
            ? {
                ...item,
                clientId,
                description,
                value: totalValue,
                dueDate: firstDueDate,
                status,
                paymentDate: status === 'paid' && !item.paymentDate ? new Date().toISOString().split('T')[0] : item.paymentDate,
                notes,
              }
            : item
        )
      }));
    } else {
      const installments = paymentType === 'installment' ? parseInt(formData.get('installmentsNumber') as string) || 1 : 1;
      const valuePerInstallment = parseFloat((totalValue / installments).toFixed(2));
      const installmentGroupId = Date.now();

      const newItems: FinancialItem[] = [];
      for (let i = 1; i <= installments; i++) {
        const dueDate = new Date(firstDueDate);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));

        newItems.push({
          id: Date.now() + i,
          type: modalType,
          clientId,
          description: `${description} ${installments > 1 ? `(Parc. ${i}/${installments})` : ''}`,
          value: valuePerInstallment,
          dueDate: dueDate.toISOString().split('T')[0],
          status,
          paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
          installment: { current: i, total: installments },
          installmentGroupId,
          notes,
        });
      }
      setData(prev => ({
        ...prev,
        financials: [...prev.financials, ...newItems]
      }));
    }
    saveData();
    setIsModalOpen(false);
    toast.success(`Lançamento ${editingFinancial ? 'atualizado' : 'adicionado'} com sucesso!`);
  };

  const getStatusBadgeClass = (status: FinancialItem['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Financeiro</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas (Mês)</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthIncome)}</div>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas (Mês)</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthExpense)}</div>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo (Mês)</CardTitle>
            <Scale className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthIncome - monthExpense)}</div>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Receber (Total)</CardTitle>
            <TriangleAlert className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">{pendingCount} lançamento(s) pendente(s)</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex border-b">
        <Button
          variant="ghost"
          className={cn("rounded-none border-b-2 border-transparent", activeTab === 'invoices' && "border-primary text-primary")}
          onClick={() => setActiveTab('invoices')}
        >
          Lançamentos
        </Button>
        <Button
          variant="ghost"
          className={cn("rounded-none border-b-2 border-transparent", activeTab === 'timesheet' && "border-primary text-primary")}
          onClick={() => setActiveTab('timesheet')}
          disabled
        >
          Timesheet
        </Button>
        <Button
          variant="ghost"
          className={cn("rounded-none border-b-2 border-transparent", activeTab === 'reports' && "border-primary text-primary")}
          onClick={() => setActiveTab('reports')}
          disabled
        >
          Relatórios
        </Button>
      </div>

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar lançamentos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={() => handleAddFinancial('revenue')} className="w-1/2 sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Lançar Receita
              </Button>
              <Button onClick={() => handleAddFinancial('expense')} variant="destructive" className="w-1/2 sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Lançar Despesa
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFinancials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Nenhum lançamento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFinancials.map((item) => {
                    const clientName = data.clients.find(c => c.id === item.clientId)?.name || 'N/A';
                    let statusDisplay = item.status;
                    const dueDate = new Date(item.dueDate + 'T00:00:00');
                    if (item.status === 'pending' && dueDate < today) {
                      statusDisplay = 'overdue';
                    }
                    const statusLabels = { paid: 'Pago', pending: 'Pendente', overdue: 'Vencido' };

                    return (
                      <TableRow key={item.id}>
                        <TableCell className={cn("font-medium", item.type === 'revenue' ? 'text-green-600' : 'text-red-600')}>
                          {item.type === 'revenue' ? 'Receita' : 'Despesa'}
                        </TableCell>
                        <TableCell>{clientName}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{new Date(item.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{formatCurrency(item.value)}</TableCell>
                        <TableCell>{item.installment.current}/{item.installment.total}</TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(statusDisplay)}`}>
                            {statusLabels[statusDisplay]}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleTogglePaymentStatus(item)} title={item.status === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago'}>
                            {item.status === 'paid' ? <Clock className="h-4 w-4 text-yellow-500" /> : <Check className="h-4 w-4 text-green-500" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditFinancial(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteFinancial(item.id)}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === 'timesheet' && (
        <div className="text-center text-muted-foreground py-10">Funcionalidade de Timesheet em desenvolvimento.</div>
      )}
      {activeTab === 'reports' && (
        <div className="text-center text-muted-foreground py-10">Funcionalidade de Relatórios em desenvolvimento.</div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingFinancial ? `Editar ${modalType === 'revenue' ? 'Receita' : 'Despesa'}` : `Novo Lançamento de ${modalType === 'revenue' ? 'Receita' : 'Despesa'}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="financialClient" className="text-right">Cliente</Label>
              <Select name="financialClient" defaultValue={editingFinancial?.clientId?.toString() || ''}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">N/A (Despesa Interna)</SelectItem>
                  {data.clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="financialDescription" className="text-right">Descrição</Label>
              <Input id="financialDescription" name="financialDescription" defaultValue={editingFinancial?.description || ''} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="financialValue" className="text-right">Valor Total (R$)</Label>
              <Input id="financialValue" name="financialValue" type="number" step="0.01" defaultValue={editingFinancial?.value || ''} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="financialDueDate" className="text-right">Vencimento</Label>
              <Input id="financialDueDate" name="financialDueDate" type="date" defaultValue={editingFinancial?.dueDate || new Date().toISOString().split('T')[0]} className="col-span-3" required />
            </div>

            {!editingFinancial && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paymentType" className="text-right">Tipo Pagamento</Label>
                  <Select value={paymentType} onValueChange={(value: 'single' | 'installment') => setPaymentType(value)} disabled={!!editingFinancial}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pagamento Único" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Pagamento Único</SelectItem>
                      <SelectItem value="installment">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentType === 'installment' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="installmentsNumber" className="text-right">Nº Parcelas</Label>
                    <Input id="installmentsNumber" name="installmentsNumber" type="number" min="1" defaultValue="1" className="col-span-3" />
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="financialStatus" className="text-right">Status</Label>
              <Select name="financialStatus" defaultValue={editingFinancial?.status || 'pending'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pendente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="financialNotes" className="text-right">Observações</Label>
              <Textarea id="financialNotes" name="financialNotes" defaultValue={editingFinancial?.notes || ''} className="col-span-3" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Lançamento</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialPage;