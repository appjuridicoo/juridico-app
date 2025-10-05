"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label'; // Adicionado importação do Label
import { Search, Newspaper, Calendar, Tag, Eye, Link, Download } from 'lucide-react';
import { toast } from 'sonner';

const PublicationsPage: React.FC = () => {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Funcionalidade de pesquisa de publicações em desenvolvimento!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Publicações / Diários Oficiais</h2>
      <p className="text-muted-foreground">Pesquise por publicações nos diários oficiais e vincule aos processos.</p>

      <form onSubmit={handleSearch} className="space-y-4 bg-card p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, OAB, número do processo..."
              className="pl-9"
            />
          </div>
          <Select>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Todos os Diários" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Diários</SelectItem>
              <SelectItem value="dje">Diário da Justiça Eletrônico</SelectItem>
              <SelectItem value="dou">Diário Oficial da União</SelectItem>
              <SelectItem value="doe">Diário Oficial do Estado</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full md:w-auto">Pesquisar</Button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Checkbox id="filterToday" />
            <label htmlFor="filterToday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Hoje
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="filterLastWeek" />
            <label htmlFor="filterLastWeek" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Última semana
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="filterLastMonth" />
            <label htmlFor="filterLastMonth" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Último mês
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="filterMyProcesses" />
            <label htmlFor="filterMyProcesses" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Meus processos
            </label>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">15 publicações encontradas (Exemplo)</span>
          <div className="flex items-center gap-2">
            <Label>Ordenar por:</Label>
            <Select defaultValue="date">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data (mais recente)</SelectItem>
                <SelectItem value="relevance">Relevância</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {/* Exemplo de item de resultado */}
          <div className="bg-card p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Processo nº 12345/2023 - Despacho</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
              <span className="flex items-center"><Newspaper className="h-4 w-4 mr-1" /> DJE - Tribunal de Justiça</span>
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> 25/10/2023</span>
              <span className="flex items-center"><Tag className="h-4 w-4 mr-1" /> Despacho</span>
            </div>
            <p className="mb-3 text-sm">
              Vistos. 1. Indefiro o pedido de gratuidade de justiça, por não preenchidos os requisitos legais. 2. Cite-se o réu para responder à acusação, no prazo legal...
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info("Visualizar publicação em desenvolvimento!")}>
                <Eye className="h-4 w-4 mr-2" /> Visualizar
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Vincular ao processo em desenvolvimento!")}>
                <Link className="h-4 w-4 mr-2" /> Vincular ao Processo
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Baixar publicação em desenvolvimento!")}>
                <Download className="h-4 w-4 mr-2" /> Baixar
              </Button>
            </div>
          </div>
          {/* Mais itens de resultado aqui */}
        </div>
      </div>
    </div>
  );
};

export default PublicationsPage;