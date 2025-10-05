"use client";

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Scale, Home, Users, Briefcase, Calendar, DollarSign, FileText, Newspaper, Search, UserRound, MessageSquare, Settings, HelpCircle, LogOut, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, onClick }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center p-3 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-sidebar-primary"
        )
      }
      onClick={onClick}
    >
      <Icon className="mr-3 h-5 w-5" />
      <span className="inline-block">{label}</span> {/* Removido 'hidden md:inline-block' para sempre exibir o label */}
    </NavLink>
  </li>
);

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void; // Callback para fechar o sheet em mobile
}

const SidebarContent: React.FC<SidebarProps> = ({ onNavigate }) => (
  <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
    <div className="flex items-center justify-center p-4 border-b border-sidebar-border">
      <Scale className="h-8 w-8 text-sidebar-primary mr-2" />
      <h2 className="text-xl font-semibold text-sidebar-primary-foreground hidden md:block">Controle Jurídico</h2>
    </div>

    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      <ul className="space-y-1">
        <NavItem to="/" icon={Home} label="Dashboard" onClick={onNavigate} />
        <NavItem to="/clients" icon={Users} label="Clientes" onClick={onNavigate} />
        <NavItem to="/processes" icon={Briefcase} label="Processos" onClick={onNavigate} />
        <NavItem to="/calendar" icon={Calendar} label="Agenda" onClick={onNavigate} />
        <NavItem to="/financial" icon={DollarSign} label="Financeiro" onClick={onNavigate} />
        <NavItem to="/documents" icon={FileText} label="Documentos" onClick={onNavigate} />
      </ul>

      <div className="border-t border-sidebar-border my-4" />

      <h3 className="text-xs uppercase text-sidebar-foreground/70 px-3 py-2 hidden md:block">Módulos Adicionais</h3>
      <ul className="space-y-1">
        <NavItem to="/publications" icon={Newspaper} label="Publicações" onClick={onNavigate} />
        <NavItem to="/research" icon={Search} label="Pesquisa Jurídica" onClick={onNavigate} />
        <NavItem to="/portal" icon={UserRound} label="Portal do Cliente" onClick={onNavigate} />
        <NavItem to="/chat" icon={MessageSquare} label="Chat Interno" onClick={onNavigate} />
      </ul>

      <div className="border-t border-sidebar-border my-4" />

      <ul className="space-y-1">
        <NavItem to="/settings" icon={Settings} label="Configurações" onClick={onNavigate} />
        <NavItem to="/help" icon={HelpCircle} label="Ajuda & Suporte" onClick={onNavigate} />
        <NavItem to="/logout" icon={LogOut} label="Sair" onClick={onNavigate} />
      </ul>
    </nav>
  </div>
);

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen fixed top-0 left-0 z-40">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;