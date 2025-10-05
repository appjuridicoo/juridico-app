"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Users, RefreshCcw } from 'lucide-react';
import { useDataStorage } from '@/hooks/use-data-storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endDate?: string;
  endTime?: string;
  type: 'audience' | 'meeting' | 'deadline' | 'task' | 'other';
  processId?: number;
  location?: string;
  description?: string;
  participants?: string;
}

const CalendarPage: React.FC = () => {
  const { data } = useDataStorage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterLawyer, setFilterLawyer] = useState('me'); // 'me' ou nome do advogado
  const [filterEventType, setFilterEventType] = useState('all'); // 'all' ou tipo de evento
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock de eventos para o calendário
  const mockEvents: CalendarEvent[] = [
    { id: 1, title: 'Audiência - Processo 12345/2023', date: '2023-11-05', time: '10:00', type: 'audience' },
    { id: 2, title: 'Reunião com cliente', date: '2023-11-10', time: '14:30', type: 'meeting' },
    { id: 3, title: 'Prazo para contestação', date: '2023-11-15', time: '18:00', type: 'deadline' },
    { id: 4, title: 'Elaborar petição', date: '2023-11-05', time: '09:00', type: 'task' },
    { id: 5, title: 'Consulta jurídica', date: '2023-11-20', time: '11:00', type: 'other' },
  ];

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.

    const calendarDays = [];

    // Empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="calendar-day other-month bg-muted/40" />);
    }

    // Days of the current month
    daysInMonth.forEach((day, index) => {
      const dayString = day.toISOString().split('T')[0];
      const isToday = day.toDateString() === new Date().toDateString();
      const dayEvents = mockEvents.filter(event => event.date === dayString);

      calendarDays.push(
        <div
          key={dayString}
          className={cn(
            "calendar-day p-2 border border-border text-sm relative group",
            isToday && "bg-blue-50 dark:bg-blue-950",
            "hover:bg-accent/50 transition-colors cursor-pointer"
          )}
          onClick={() => toast.info(`Eventos para ${day.toLocaleDateString('pt-BR')}: ${dayEvents.length > 0 ? dayEvents.map(e => e.title).join(', ') : 'Nenhum'}`)}
        >
          <div className="font-semibold text-right text-foreground">{day.getDate()}</div>
          <div className="space-y-1 mt-1">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className={cn(
                  "text-xs px-1 py-0.5 rounded-sm truncate",
                  event.type === 'audience' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                  event.type === 'meeting' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                  event.type === 'deadline' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                  event.type === 'task' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                  event.type === 'other' && 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                )}
                title={`${event.time} - ${event.title}`}
              >
                {event.time} {event.title}
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      );
    });

    return (
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-muted p-2 text-center font-semibold text-muted-foreground text-sm">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>
    );
  };

  const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleNewAppointment = () => {
    setIsModalOpen(true);
  };

  const handleAppointmentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Lógica para adicionar o compromisso
    toast.success('Compromisso agendado com sucesso!');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Agenda / Calendário</h2>

      <div className="bg-card p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={handleToday}>Hoje</Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
            <span className="text-lg font-semibold ml-4">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant={viewMode === 'month' ? 'default' : 'outline'} onClick={() => setViewMode('month')}>Mês</Button>
            <Button variant={viewMode === 'week' ? 'default' : 'outline'} onClick={() => setViewMode('week')} disabled>Semana</Button>
            <Button variant={viewMode === 'day' ? 'default' : 'outline'} onClick={() => setViewMode('day')} disabled>Dia</Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterLawyer} onValueChange={setFilterLawyer}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Meu Calendário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="me">Meu Calendário</SelectItem>
                {data.lawyers.map(lawyer => (
                  <SelectItem key={lawyer.id} value={lawyer.name}>{lawyer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEventType} onValueChange={setFilterEventType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os Eventos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Eventos</SelectItem>
                <SelectItem value="audience">Audiência</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="deadline">Prazo</SelectItem>
                <SelectItem value="task">Tarefa</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => toast.info("Funcionalidade de sincronização em desenvolvimento!")}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Sincronizar
            </Button>
          </div>
          <Button onClick={handleNewAppointment}>
            <Plus className="h-4 w-4 mr-2" /> Novo Compromisso
          </Button>
        </div>

        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && <div className="text-center text-muted-foreground py-10">Visualização por semana em desenvolvimento.</div>}
        {viewMode === 'day' && <div className="text-center text-muted-foreground py-10">Visualização por dia em desenvolvimento.</div>}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agendar Compromisso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAppointmentSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentTitle" className="text-right">Título</Label>
              <Input id="appointmentTitle" name="appointmentTitle" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentDate" className="text-right">Data</Label>
              <Input id="appointmentDate" name="appointmentDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentTime" className="text-right">Hora</Label>
              <Input id="appointmentTime" name="appointmentTime" type="time" defaultValue="09:00" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentType" className="text-right">Tipo</Label>
              <Select name="appointmentType" defaultValue="meeting">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audience">Audiência</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="deadline">Prazo</SelectItem>
                  <SelectItem value="task">Tarefa</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentProcess" className="text-right">Processo</Label>
              <Select name="appointmentProcess" defaultValue="none"> {/* Alterado para 'none' */}
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem> {/* Alterado para 'none' */}
                  {data.processes.map(process => (
                    <SelectItem key={process.id} value={process.id.toString()}>{process.number} - {process.client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentLocation" className="text-right">Local</Label>
              <Input id="appointmentLocation" name="appointmentLocation" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentDescription" className="text-right">Descrição</Label>
              <Textarea id="appointmentDescription" name="appointmentDescription" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentParticipants" className="text-right">Participantes</Label>
              <Input id="appointmentParticipants" name="appointmentParticipants" placeholder="Separe por vírgula" className="col-span-3" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Agendar Compromisso</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;