"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Edit, Plus, Search, Trash, Bell, Users, FileText, Plug, Gavel } from 'lucide-react';
import { useDataStorage, Lawyer, UserProfile } from '@/hooks/use-data-storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const SettingsPage: React.FC = () => {
  const { data, setData, saveData } = useDataStorage();
  const [activeSetting, setActiveSetting] = useState<'profile' | 'lawyers' | 'notifications' | 'team' | 'templates' | 'integrations'>('profile');

  // --- Profile State ---
  const [profileFormState, setProfileFormState] = useState<UserProfile>(data.userProfile);
  const profilePicUploaderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfileFormState(data.userProfile);
  }, [data.userProfile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setProfileFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile = {
      ...profileFormState,
      displayName: `Dr. ${profileFormState.fullName.split(' ')[0]}` // Atualiza displayName
    };
    setData(prev => ({ ...prev, userProfile: updatedProfile }));
    saveData();
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newAvatarUrl = e.target?.result as string;
      setData(prev => ({ ...prev, userProfile: { ...prev.userProfile, avatarUrl: newAvatarUrl } }));
      saveData();
      toast.success('Foto de perfil atualizada!');
    };
    reader.readAsDataURL(file);
    if (profilePicUploaderRef.current) profilePicUploaderRef.current.value = '';
  };

  // --- Lawyers State ---
  const [isLawyerModalOpen, setIsLawyerModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);
  const [lawyerSearchTerm, setLawyerSearchTerm] = useState('');

  const filteredLawyers = data.lawyers.filter(lawyer =>
    lawyer.name.toLowerCase().includes(lawyerSearchTerm.toLowerCase()) ||
    lawyer.oab.toLowerCase().includes(lawyerSearchTerm.toLowerCase()) ||
    lawyer.email.toLowerCase().includes(lawyerSearchTerm.toLowerCase())
  );

  const handleAddLawyer = () => {
    setEditingLawyer(null);
    setIsLawyerModalOpen(true);
  };

  const handleEditLawyer = (lawyer: Lawyer) => {
    setEditingLawyer(lawyer);
    setIsLawyerModalOpen(true);
  };

  const handleDeleteLawyer = (id: number, name: string) => {
    const isResponsible = data.processes.some(p => p.responsible === name);
    if (isResponsible) {
      toast.error('Não é possível excluir este advogado.', { description: 'Ele(a) é o responsável por um ou mais processos.' });
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o advogado(a) ${name}?`)) {
      setData(prev => ({
        ...prev,
        lawyers: prev.lawyers.filter(lawyer => lawyer.id !== id)
      }));
      saveData();
      toast.success('Advogado(a) excluído(a) com sucesso!');
    }
  };

  const handleLawyerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLawyer: Lawyer = {
      id: editingLawyer?.id || Date.now(),
      name: formData.get('lawyerName') as string,
      oab: formData.get('lawyerOab') as string,
      email: formData.get('lawyerEmail') as string,
      phone: formData.get('lawyerPhone') as string,
      status: formData.get('lawyerStatus') as 'ativo' | 'inativo',
    };

    setData(prev => {
      if (editingLawyer) {
        return {
          ...prev,
          lawyers: prev.lawyers.map(lawyer =>
            lawyer.id === newLawyer.id ? newLawyer : lawyer
          )
        };
      } else {
        return {
          ...prev,
          lawyers: [...prev.lawyers, newLawyer]
        };
      }
    });
    saveData();
    setIsLawyerModalOpen(false);
    toast.success(`Advogado(a) ${editingLawyer ? 'atualizado' : 'adicionado'} com sucesso!`);
  };

  const getStatusBadgeClass = (status: Lawyer['status']) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inativo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Configurações</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        <aside className="bg-card p-4 rounded-lg shadow-sm">
          <nav className="space-y-1">
            <Button
              variant="ghost"
              className={cn("w-full justify-start", activeSetting === 'profile' && "bg-accent text-accent-foreground")}
              onClick={() => setActiveSetting('profile')}
            >
              <User className="mr-2 h-4 w-4" /> Meu Perfil
            </Button>
            <Button
              variant="ghost"
              className={cn("w-full justify-start", activeSetting === 'lawyers' && "bg-accent text-accent-foreground")}
              onClick={() => setActiveSetting('lawyers')}
            >
              <Gavel className="mr-2 h-4 w-4" /> Gestão de Advogados
            </Button>
            <Button
              variant="ghost"
              className={cn("w-full justify-start", activeSetting === 'notifications' && "bg-accent text-accent-foreground")}
              onClick={() => setActiveSetting('notifications')}
            >
              <Bell className="mr-2 h-4 w-4" /> Notificações
            </Button>
            <Button
              variant="ghost"
              className={cn("w-full justify-start", activeSetting === 'team' && "bg-accent text-accent-foreground")}
              onClick={() => setActiveSetting('team')}
              disabled
            >
              <Users className="mr-2 h-4 w-4" /> Gestão de Equipe
            </Button>
            <Button
              variant="ghost"
              className={cn("w-full justify-start", activeSetting === 'templates' && "bg-accent text-accent-foreground")}
              onClick={() => setActiveSetting('templates')}
              disabled
            >
              <FileText className="mr-2 h-4 w-4" /> Modelos de Documentos
            </Button>
            <Button
              variant="ghost"
              className={cn("w-full justify-start", activeSetting === 'integrations' && "bg-accent text-accent-foreground")}
              onClick={() => setActiveSetting('integrations')}
              disabled
            >
              <Plug className="mr-2 h-4 w-4" /> Integrações
            </Button>
          </nav>
        </aside>

        <div className="bg-card p-6 rounded-lg shadow-sm">
          {activeSetting === 'profile' && (
            <div id="profile-settings" className="space-y-6">
              <h3 className="text-2xl font-semibold border-b pb-4">Meu Perfil</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2">
                    <AvatarImage src={profileFormState.avatarUrl || "https://i.pravatar.cc/150?img=12"} alt="Foto do perfil" />
                    <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                  </Avatar>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    onClick={() => profilePicUploaderRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    ref={profilePicUploaderRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <h4 className="text-xl font-medium">{profileFormState.displayName}</h4>
                  <p className="text-muted-foreground text-sm">Advogado - OAB/{profileFormState.oabState} {profileFormState.oab}</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input id="fullName" value={profileFormState.fullName} onChange={handleProfileChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" value={profileFormState.email} onChange={handleProfileChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" type="tel" value={profileFormState.phone} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oab">Número da OAB</Label>
                    <Input id="oab" value={profileFormState.oab} onChange={handleProfileChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oabState">Seção da OAB</Label>
                  <Select value={profileFormState.oabState} onValueChange={(value) => setProfileFormState(prev => ({ ...prev, oabState: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="ES">ES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea id="bio" value={profileFormState.bio} onChange={handleProfileChange} rows={4} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setProfileFormState(data.userProfile)}>Cancelar</Button>
                  <Button type="submit">Salvar Alterações</Button>
                </div>
              </form>
            </div>
          )}

          {activeSetting === 'lawyers' && (
            <div id="lawyers-settings" className="space-y-6">
              <h3 className="text-2xl font-semibold border-b pb-4">Gestão de Advogados</h3>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar advogados por nome, OAB..."
                    className="pl-9"
                    value={lawyerSearchTerm}
                    onChange={(e) => setLawyerSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddLawyer} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Novo Advogado
                </Button>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>OAB</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLawyers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          Nenhum advogado encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLawyers.map((lawyer) => (
                        <TableRow key={lawyer.id}>
                          <TableCell className="font-medium">{lawyer.name}</TableCell>
                          <TableCell>{lawyer.oab}</TableCell>
                          <TableCell>{lawyer.email}</TableCell>
                          <TableCell>{lawyer.phone}</TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(lawyer.status)}`}>
                              {lawyer.status.charAt(0).toUpperCase() + lawyer.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditLawyer(lawyer)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLawyer(lawyer.id, lawyer.name)}>
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <Dialog open={isLawyerModalOpen} onOpenChange={setIsLawyerModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingLawyer ? 'Editar Advogado' : 'Adicionar Novo Advogado'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleLawyerSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="lawyerName" className="text-right">Nome</Label>
                      <Input id="lawyerName" name="lawyerName" defaultValue={editingLawyer?.name || ''} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="lawyerOab" className="text-right">OAB</Label>
                      <Input id="lawyerOab" name="lawyerOab" defaultValue={editingLawyer?.oab || ''} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="lawyerEmail" className="text-right">E-mail</Label>
                      <Input id="lawyerEmail" name="lawyerEmail" type="email" defaultValue={editingLawyer?.email || ''} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="lawyerPhone" className="text-right">Telefone</Label>
                      <Input id="lawyerPhone" name="lawyerPhone" type="tel" defaultValue={editingLawyer?.phone || ''} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="lawyerStatus" className="text-right">Status</Label>
                      <Select name="lawyerStatus" defaultValue={editingLawyer?.status || 'ativo'}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => setIsLawyerModalOpen(false)}>Cancelar</Button>
                      <Button type="submit">Salvar Advogado</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeSetting === 'notifications' && (
            <div id="notifications-settings" className="space-y-6">
              <h3 className="text-2xl font-semibold border-b pb-4">Configurações de Notificação</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações por E-mail</h4>
                    <p className="text-sm text-muted-foreground">Receba notificações importantes no seu e-mail</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações por Push</h4>
                    <p className="text-sm text-muted-foreground">Receba notificações no seu dispositivo móvel</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Novos Prazos</h4>
                    <p className="text-sm text-muted-foreground">Seja notificado sobre novos prazos processuais</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Atualizações de Processos</h4>
                    <p className="text-sm text-muted-foreground">Receba alertas sobre movimentações nos processos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Compromissos da Agenda</h4>
                    <p className="text-sm text-muted-foreground">Lembretes sobre audiências e reuniões</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Faturas e Pagamentos</h4>
                    <p className="text-sm text-muted-foreground">Alertas sobre vencimentos e pagamentos</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          )}

          {activeSetting === 'team' && (
            <div className="text-center text-muted-foreground py-10">Funcionalidade de Gestão de Equipe em desenvolvimento.</div>
          )}
          {activeSetting === 'templates' && (
            <div className="text-center text-muted-foreground py-10">Funcionalidade de Modelos de Documentos em desenvolvimento.</div>
          )}
          {activeSetting === 'integrations' && (
            <div className="text-center text-muted-foreground py-10">Funcionalidade de Integrações em desenvolvimento.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;